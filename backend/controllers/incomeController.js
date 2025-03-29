const fs = require("fs"); 
const xlsx = require("xlsx");
const path = require("path");
const Income = require("../models/Income");


//Add Income Source
exports.addIncome = async(req,res) => {
    const userId = req.user.id;

    try{
        const { icon, source, amount, date } = req.body;

        //Validation : Check for missing fields
        if(!source || !amount || !date){
            return res.status(400).json({message:"ALl fields are required"});
        }

        const newIncome = new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
}
//Get all income Sources
exports.getAllIncome = async(req,res) => {
    const userId = req.user.id;

    try{
        const income = await Income.find({userId}).sort({ date: -1 });
        res.json(income);
    }catch(err){
        res.status(500).json({message:"Server Error"});
    }
};
 
//Delete Income Source
exports.deleteIncome = async(req,res) => {
     try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({message:"Income deleted successfully"});
     }catch(error){
        res.status(500).json({message:"Server Error"});
     }
};
 
//Download Report

exports.downloadIncomeExcel = async (req, res) => {
    const userId = req.user.id; // Get the logged-in user's ID

    try {
        // Fetch income records from the database
        const income = await Income.find({ userId }).sort({ date: -1 });

        // Prepare data for Excel
        const data = income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date.toISOString().split("T")[0], // Format date properly
        }));

        // Create a new Excel workbook and worksheet
        const wb = xlsx.utils.book_new(); // Create a new workbook
        const ws = xlsx.utils.json_to_sheet(data); // Convert JSON data to a worksheet
        xlsx.utils.book_append_sheet(wb, ws, "Income Details"); // Add worksheet to workbook

        // Define the file name and save it
        const filePath = path.resolve(__dirname, "income_details.xlsx"); // Use path.resolve to create an absolute path
        xlsx.writeFile(wb, filePath); // Save the file in the server

        // Set headers for the response to indicate a file download
        res.attachment("income_details.xlsx"); // Set the file attachment header
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
