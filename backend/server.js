require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

const calificacionSchema = new mongoose.Schema(
  {
    matricula: {
      type: Number,          
      required: true,
      unique: true,          
      min: 1,
    },
    nombre: {
      type: String,
      required: true,
      trim: true,
    },
    materia: {
      type: String,
      required: true,
      trim: true,
    },
    calificacion: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true }
);

const Calificacion = mongoose.model("Calificacion", calificacionSchema);

app.get("/api/calificaciones", async (req, res) => {
  try {
    const calificaciones = await Calificacion.find().sort({ createdAt: -1 });
    res.json(calificaciones);
  } catch (error) {
    console.error("Error GET /api/calificaciones:", error);
    res.status(500).json({ message: "Error al obtener calificaciones" });
  }
});

app.post("/api/calificaciones", async (req, res) => {
  try {
    const { matricula, nombre, materia, calificacion } = req.body;

    const nueva = new Calificacion({
      matricula: Number(matricula),
      nombre,
      materia,
      calificacion: Number(calificacion),
    });

    const guardada = await nueva.save();
    res.status(201).json(guardada);
  } catch (error) {
    console.error("Error POST /api/calificaciones:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "La matrícula ya está registrada" });
    }

    res.status(400).json({ message: "Error al crear calificación" });
  }
});

app.put("/api/calificaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { matricula, nombre, materia, calificacion } = req.body;

    const actualizada = await Calificacion.findByIdAndUpdate(
      id,
      {
        matricula: Number(matricula),
        nombre,
        materia,
        calificacion: Number(calificacion),
      },
      { new: true, runValidators: true }
    );

    if (!actualizada) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    res.json(actualizada);
  } catch (error) {
    console.error("Error PUT /api/calificaciones/:id:", error);
    res.status(400).json({ message: "Error al actualizar calificación" });
  }
});

app.delete("/api/calificaciones/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const eliminada = await Calificacion.findByIdAndDelete(id);

    if (!eliminada) {
      return res.status(404).json({ message: "Calificación no encontrada" });
    }

    res.json({ message: "Calificación eliminada" });
  } catch (error) {
    console.error("Error DELETE /api/calificaciones/:id:", error);
    res.status(400).json({ message: "Error al eliminar calificación" });
  }
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
