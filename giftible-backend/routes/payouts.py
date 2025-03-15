from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Payout, UniversalUser, NGO
from schemas import PayoutRequest, PayoutResponse
from .sales import get_pending_payouts
from typing import List
from datetime import datetime, timedelta
from .auth import get_current_user  # ✅ Ensure user authentication
from typing import List, Optional
from sqlalchemy import func

router = APIRouter(prefix="/payouts", tags=["Payouts"])


# ✅ 1. NGO Requests a Payout (Restricted to NGOs only)
@router.post("/request", response_model=PayoutResponse)
def request_payout(
    request: PayoutRequest,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)  # ✅ Ensure user is logged in
):
    # ✅ Only NGOs can request payouts
    if current_user.role != "ngo":
        raise HTTPException(status_code=403, detail="Access denied. Only NGOs can request payouts.")

    # ✅ NGOs can only request their own payouts
    if current_user.id != request.universal_user_id:
        raise HTTPException(status_code=403, detail="NGOs can only request payouts for their own account.")

    # ✅ Call get_pending_payouts() with `current_user`
    pending_amount = get_pending_payouts(request.universal_user_id, db, current_user)

    if request.amount > pending_amount:
        raise HTTPException(status_code=400, detail="Requested amount exceeds pending balance.")

    # ✅ Create payout request
    payout = Payout(
        universal_user_id=request.universal_user_id,
        amount=request.amount,
        status="Pending",
        created_at=datetime.utcnow()
    )
    db.add(payout)
    db.commit()
    db.refresh(payout)
    return payout



# ✅ 2. Admin Views Pending Payout Requests (Restricted to Admins only)
@router.get("/pending", response_model=List[PayoutResponse])
def get_pending_payouts_list(
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Only Admins can view pending payout requests
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only Admins can view pending payouts.")

    # ✅ Query to fetch pending payouts with linked NGO name
    pending_payouts = (
        db.query(
            Payout.id,
            Payout.universal_user_id,
            Payout.amount,
            Payout.status,
            Payout.created_at,
            Payout.processed_at,
            NGO.ngo_name  # ✅ Fetch NGO Name from the linked universal user
        )
        .join(UniversalUser, UniversalUser.id == Payout.universal_user_id)  # ✅ Join UniversalUser
        .join(NGO, NGO.universal_user_id == UniversalUser.id)  # ✅ Link UniversalUser to NGO
        .filter(Payout.status == "Pending")
        .all()
    )

    # ✅ Convert query result to response model
    return [
        PayoutResponse(
            id=row[0],
            universal_user_id=row[1],
            amount=row[2],
            status=row[3],
            created_at=row[4],
            processed_at=row[5],
            ngo_name=row[6]  # ✅ Return Only NGO Name
        )
        for row in pending_payouts
    ]




# ✅ 3. Admin Approves/Rejects Payout Request (Restricted to Admins only)
@router.put("/process/{payout_id}", response_model=PayoutResponse)
def process_payout(
    payout_id: int,
    approved: bool,
    db: Session = Depends(get_db),
    current_user: UniversalUser = Depends(get_current_user)
):
    # ✅ Only Admins can process payouts
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Only Admins can process payouts.")

    payout = db.query(Payout).filter(Payout.id == payout_id).first()
    if not payout:
        raise HTTPException(status_code=404, detail="Payout request not found.")

    # ✅ Update payout status
    payout.status = "Completed" if approved else "Rejected"
    payout.processed_at = datetime.utcnow()
    db.commit()
    db.refresh(payout)
    return payout


# ✅ 4. Get NGO's Payout History (NGOs can only view their own, Admins can see all)
@router.get("/history", response_model=List[PayoutResponse])
def get_payout_history(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    search_query: Optional[str] = Query(None, description="Search by NGO name or payout ID"),
    ngo_id: Optional[int] = None,
    current_user: UniversalUser = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieve payout history:
    - If **Admin**: Can see payouts for all NGOs.
    - If **NGO**: Can only see their own payouts.
    - Filters: **Start Date, End Date (till 23:59:59), NGO ID, Search Query**.
    """

    # ✅ Ensure the user has permission to access this endpoint
    if current_user.role not in ["admin", "ngo"]:
        raise HTTPException(status_code=403, detail="Access denied. Only Admins and NGOs can access payout history.")

    # ✅ Parse start_date and end_date (Default: From the beginning to today)
    try:
        start_date = datetime.strptime(start_date, "%Y-%m-%d") if start_date else datetime(1970, 1, 1)
        end_date = datetime.strptime(end_date, "%Y-%m-%d") if end_date else datetime.utcnow()
        end_date = end_date.replace(hour=23, minute=59, second=59)  # ✅ Ensure full-day inclusion
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    # ✅ Ensure start_date is before end_date
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date must be before end date.")

    # ✅ Base query to fetch payout history
    query = (
        db.query(
            Payout.id,
            Payout.universal_user_id,
            NGO.ngo_name,  # ✅ Retrieve NGO name
            Payout.amount,
            Payout.status,
            Payout.created_at,
            Payout.processed_at,
        )
        .join(NGO, NGO.universal_user_id == Payout.universal_user_id)  # ✅ Join NGO table
        .filter(Payout.created_at >= start_date, Payout.created_at <= end_date)
    )

    # ✅ If NGO is logged in, restrict to their own payouts
    if current_user.role == "ngo":
        query = query.filter(Payout.universal_user_id == current_user.id)

    # ✅ If Admin provides ngo_id, filter payouts for that NGO
    if ngo_id and current_user.role == "admin":
        query = query.filter(Payout.universal_user_id == ngo_id)

    # ✅ Search filter for NGO name or payout ID
    if search_query:
        query = query.filter(
            (NGO.ngo_name.ilike(f"%{search_query}%")) | (Payout.id.ilike(f"%{search_query}%"))
        )

    # ✅ Retrieve results and format response
    results = query.order_by(Payout.created_at.desc()).all()

    return [
        PayoutResponse(
            id=row[0],
            universal_user_id=row[1],
            ngo_name=row[2],  # ✅ Include NGO name
            amount=row[3],
            status=row[4],
            created_at=row[5],
            processed_at=row[6],
        )
        for row in results
    ]

