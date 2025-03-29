const fs = require("fs"); 
const xlsx = require("xlsx");
const path = require("path");
const Expense = require("../models/Expense");


//Add Expense Source
exports.addExpense = async(req,res) => {
    const userId = req.user.id;

    try{
        const { icon, category, amount, date } = req.body;

        //Validation : Check for missing fields
        if(!category || !amount || !date){
            return res.status(400).json({message:"ALl fields are required"});
        }

        const newExpense = new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });

        await newExpense.save();
        res.status(200).json(newExpense);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
}
//Get all expense Sources
exports.getAllExpense = async(req,res) => {
    const userId = req.user.id;

    try{
        const expense = await Expense.find({userId}).sort({ date: -1 });
        res.json(expense);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};
 
//Delete Income Source
exports.deleteExpense = async(req,res) => {
     try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message:"Expense deleted successfully"});
     }catch(error){
        res.status(500).json({message:"Server Error"});
     }
};
 
//Download Report

exports.downloadExpenseExcel = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID

    try {
        // Fetch income records from the database
        const expense = await Expense.find({ userId }).sort({ date: -1 });

        // Prepare data for Excel
        const data = expense.map((item) => ({
            Category: item.category,
            Amount: item.amount,
            Date: item.date.toISOString().split("T")[0], // Format date properly
        }));

        // Create a new Excel workbook and worksheet
        const wb = xlsx.utils.book_new(); // Create a new workbook
        const ws = xlsx.utils.json_to_sheet(data); // Convert JSON data to a worksheet
        xlsx.utils.book_append_sheet(wb, ws, "Income Details"); // Add worksheet to workbook

        // Define the file name and save it
        const filePath = path.resolve(__dirname, "expense_details.xlsx"); // Use path.resolve to create an absolute path
        xlsx.writeFile(wb, filePath); // Save the file in the server

        // Set headers for the response to indicate a file download
        res.attachment("expense_details.xlsx"); // Set the file attachment header
        res.sendFile(filePath, (err) => { // Send the file
            if (err) {
                console.error("Error sending file:", err);
                return res.status(500).json({ message: "Error downloading file" });
            }

            // Delete the file after sending (to free up space)
            fs.unlinkSync(filePath);
        });
    } catch (error) {
        console.error("Download Error:", error); // Log the error for debugging
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};
