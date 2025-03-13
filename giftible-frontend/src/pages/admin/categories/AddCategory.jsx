import React, { useState } from "react";
import { Box, TextField, Button, Typography } from "@mui/material";
import { createCategory } from "../../../services/categoryService";

const AddCategory = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCategory({ name, description });
      alert("✅ Category submitted for approval!");
      setName("");
      setDescription("");
    } catch (err) {
      console.error("❌ Error creating category:", err);
      alert("❌ Failed to create category.");
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 4 }}>
      <Typography variant="h5" mb={2}>Add New Category</Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Category Name"
          fullWidth
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          margin="normal"
        />
        <TextField
          label="Description"
          fullWidth
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          margin="normal"
        />
        <Button type="submit" variant="contained" color="secondary" fullWidth>
          Submit for Approval
        </Button>
      </form>
    </Box>
  );
};

export default AddCategory;
