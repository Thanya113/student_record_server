
const fs = require("fs");
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const multer = require("multer");
const path = require("path");


const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8081
const mongoURI = 'mongodb://127.0.0.1:27017/crudoperation';
const facultyMongoURI = 'mongodb://127.0.0.1:27017/facultyoperation';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage });
app.use(express.static(path.join(__dirname, "client/build")));

// API endpoint for file upload for faculty
app.post("/faculty/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, path } = req.file;  // Change 'filename' to 'originalname'

    // Save file information to MongoDB for faculty
    const file = new facultyModel({ filename: originalname, filepath: path });
    await file.save();

    res.json({ success: true, message: "File uploaded successfully for faculty!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error for faculty upload" });
  }
});

app.get("/stud/download/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    console.log("Trying to download file:", filename);

    const filePath = path.join(__dirname, "uploads", filename);

    // Set the Content-Disposition header to suggest the filename
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', 'application/pdf'); // Set the appropriate content type

    // Pipe the file stream to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error for students download" });
  }
});

app.get("/stud/view/:filename", (req, res) => {
  try {
    const { filename } = req.params;
    console.log("Trying to view file:", filename);

    const filePath = path.join(__dirname, "uploads", filename);

    // Check if the file exists
    if (!fs.existsSync(filePath)) {
      console.log("File not found");
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Serve the file content
    const fileStream = fs.createReadStream(filePath);

    // Set the Content-Type header based on file type
    res.setHeader('Content-Type', 'application/pdf'); // Adjust based on your file type

    // Pipe the file stream to the response
    fileStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error for viewing file" });
  }
});


//schema
const schemaData = mongoose.Schema({
    roll: String,
    name: String,
    dept: String,
    sec: String,
    email: String,
    mobile: String,
    results: {
        mark1: Number, 
        grade1: String ,
        mark2: Number, 
        grade2: String ,
        mark3: Number, 
        grade3: String ,
        mark4: Number, 
        grade4: String ,
        mark5: Number, 
        grade5: String ,
        gpa: Number,
        cgpa: Number,
    },
}, {
    timestamps: true
});


const userModel = mongoose.model("user",schemaData)

const facultySchema = mongoose.Schema({
  fid: String,
  fname: String,
  desig: String,
  spec: String,
  exp: String,
  femail: String,
  fmobile: String,
  // Add any other faculty-specific fields
}, {
  timestamps: true,
});

const facultyModel = mongoose.model("faculty", facultySchema);


//read
//http://localhost:8081/
app.get("/",async(req,res)=>{
    const data = await userModel.find({})
    res.json({success : true, data : data})
})

//create data || save data in mongodb
//http://localhost:8081/create
/*
{
    roll,
    name,
    dept,
    sec,
    email,
    mobile
}
*/
app.post("/create",async(req,res)=>{
   console.log(req.body)
   const data = new userModel(req.body)
   await data.save()
   res.send({success : true, message : "data saved successfully",data : data})
})

//update data
//http://localhost:8081/update
/**
 * {
 * id :"",
 * roll:"",
 * name:"",
 * dept:"",
 * sec:"",
 * email:"",
 * mobile:""
 * }
 */
app.put("/update",async(req,res)=>{
    console.log(req.body)
    const { 
        _id,...rest}=req.body

    console.log(rest)
    const data = await userModel.updateOne({ _id : _id},rest)
    res.send({success : true, message : "data updated successfully", data : data})
})

//delete api
//http://localhost:8081/delete/id

app.delete("/delete/:id",async(req,res)=>{
 const id = req.params.id
 console.log(id);
 const data = await userModel.deleteOne({ _id : id})
    res.send({success : true, message : "data deleted successfully", data : data})
})
 // Add these routes to your existing index.js file

 app.get("/faculty", async (req, res) => {
  try {
      const data = await facultyModel.find({});
      res.json({ success: true, data: data });
  } catch (error) {
      console.error('Error fetching faculty:', error);
      res.json({ success: false, message: 'Error fetching faculty' });
  }
});

// Create faculty
app.post("/faculty/create", async (req, res) => {
  const data = new facultyModel(req.body);
  try {
      await data.save();
      res.send({ success: true, message: "Faculty data saved successfully", data: data });
  } catch (error) {
      console.error('Error saving faculty data:', error);
      res.json({ success: false, message: 'Error saving faculty data' });
  }
});
// Update faculty
app.put("/faculty/update", async (req, res) => {
  const { _id, ...rest } = req.body;
  try {
      const data = await facultyModel.updateOne({ _id: _id }, rest);
      res.send({ success: true, message: "Faculty data updated successfully", data: data });
  } catch (error) {
      console.error('Error updating faculty data:', error);
      res.json({ success: false, message: 'Error updating faculty data' });
  }
});

// Delete faculty
app.delete("/faculty/delete/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const data = await facultyModel.deleteOne({ _id: id });
        res.send({ success: true, message: "Faculty data deleted successfully", data: data });
    } catch (error) {
        console.error('Error deleting faculty data:', error);
        res.json({ success: false, message: 'Error deleting faculty data' });
    }
});




 app.post('/login', async (req, res) => {
    const { roll, name } = req.body;
  
    try {
      const user = await userModel.findOne({ roll, name });
      if (user) {
        res.json({ success: true, userId: user._id });
      } else {
        res.json({ success: false, message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error during login:', error);
      res.json({ success: false, message: 'Error during login' });
    }
  });
  
  
  app.get('/stud', async (req, res) => {
    const userId = req.query.userId;
  
    try {
      const student = await userModel.findById(userId);
      if (student) {
        res.json({ success: true, data: student });
      } else {
        res.json({ success: false, message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error fetching student details:', error);
      res.json({ success: false, message: 'Error fetching student details' });
    }
  });
  
  app.get("/fetchFromMongo", async (req, res) => {
    try {
        const data = await userModel.find({});
        res.json({ success: true, data: data });
    } catch (error) {
        console.error('Error fetching data from MongoDB:', error);
        res.json({ success: false, message: 'Error fetching data from MongoDB' });
    }
});



// Add these routes to your existing index.js file or wherever your routes are defined

// Fetch all students
app.get('/fetchStudents', async (req, res) => {
    try {
      const students = await userModel.find({});
      res.json({ success: true, data: students });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.json({ success: false, message: 'Error fetching students' });
    }
  });
  
 // Add these routes to your existing index.js file or wherever your routes are defined

// Send results for a specific student
app.post('/stud/sendResults', async (req, res) => {
    const { studentId, results } = req.body;
    console.log('Received data:', { studentId, results });
    try {
      // Update the student's results in the database
      const updatedStudent = await userModel.findByIdAndUpdate(
        studentId,
        { 
          $set: {
            'results.mark1': results.mark1,
            'results.grade1': results.grade1,
            'results.mark2': results.mark2,
            'results.grade2': results.grade2,
            'results.mark3': results.mark3,
            'results.grade3': results.grade3,
            'results.mark4': results.mark4,
            'results.grade4': results.grade4,
            'results.mark5': results.mark5,
            'results.grade5': results.grade5,
            'results.gpa': results.gpa,
            'results.cgpa': results.cgpa,
          }
        },
        { new: true }
      );
  
      if (updatedStudent) {
        res.json({ success: true, message: 'Results sent successfully' });
      } else {
        res.json({ success: false, message: 'Student not found' });
      }
    } catch (error) {
      console.error('Error sending results:', error);
      res.json({ success: false, message: 'Error sending results' });
    }
  });
// ... (existing imports and configurations)
app.get('/fac', async (req, res) => {
  const userId = req.query.userId;

  try {
    const faculty = await facultyModel.findById(userId);
    if (faculty) {
      console.log('Faculty details:', faculty);
      res.json({ success: true, data: faculty });
    } else {
      console.log('Faculty not found');
      res.json({ success: false, message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error fetching faculty details:', error);
    res.json({ success: false, message: 'Error fetching faculty details' });
  }
});

app.post('/faculty-login', async (req, res) => {
  const { email, fid } = req.body;

  try {
    const faculty = await facultyModel.findOne({ femail: email, fid: fid });
    if (faculty) {
      console.log('Faculty found:', faculty);
      res.json({ success: true, facultyId: faculty._id });
    } else {
      console.log('Faculty not found');
      res.json({ success: false, message: 'Faculty not found' });
    }
  } catch (error) {
    console.error('Error during faculty login:', error);
    res.json({ success: false, message: 'Error during faculty login' });
  }
});
// Add this route after your existing routes







  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then(() => {
      console.log("Connected to the databases");
      app.listen(PORT, () => console.log("Server is running"));
    })
    .catch((err) => console.log(err));