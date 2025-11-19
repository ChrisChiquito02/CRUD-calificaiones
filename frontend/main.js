const API_URL = "http://localhost:3000/api/calificaciones";

const formRegistro      = document.getElementById("formRegistro");
const inputMatricula    = document.getElementById("inputMatricula");
const inputNombre       = document.getElementById("inputNombre");
const inputMateria      = document.getElementById("inputMateria");
const inputCalificacion = document.getElementById("inputCalificacion");
const btnGuardar        = document.getElementById("btnGuardar");
const btnLimpiar        = document.getElementById("btnLimpiar");
const tbody             = document.querySelector("#tablaRegistros tbody");

let idEnEdicion = null;

document.addEventListener("DOMContentLoaded", () => {
  cargarCalificaciones();
  configurarEventos();
});

function configurarEventos() {
  formRegistro.addEventListener("submit", manejarSubmit);
  btnLimpiar.addEventListener("click", limpiarFormulario);

  [inputMatricula, inputNombre, inputMateria, inputCalificacion].forEach((input) => {
    input.addEventListener("input", () => {
      validarCampos();
    });
  });
}

async function cargarCalificaciones() {
  try {
    const respuesta = await fetch(API_URL);
    if (!respuesta.ok) throw new Error("Error al obtener calificaciones");
    const datos = await respuesta.json();
    renderTabla(datos);
  } catch (error) {
    console.error(error);
    alert("No se pudieron cargar las calificaciones");
  }
}

function renderTabla(calificaciones) {
  tbody.innerHTML = "";

  calificaciones.forEach((c) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${c.matricula}</td>
      <td>${c.nombre}</td>
      <td>${c.materia}</td>
      <td>${c.calificacion}</td>
      <td class="text-end">
        <button type="button" class="btn btn-sm btn-warning me-2"
                data-id="${c._id}" data-action="editar">Editar</button>
        <button type="button" class="btn btn-sm btn-danger"
                data-id="${c._id}" data-action="eliminar">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  tbody.querySelectorAll("button").forEach((btn) => {
    btn.addEventListener("click", manejarClickTabla);
  });
}

async function manejarSubmit(event) {
  event.preventDefault();

  validarCampos();
  formRegistro.classList.add("was-validated");

  if (!formRegistro.checkValidity()) return;

  const datos = obtenerValoresFormulario();

  try {
    if (idEnEdicion) {
      await actualizarCalificacion(idEnEdicion, datos);
    } else {
      await crearCalificacion(datos);
    }

    limpiarFormulario();
    await cargarCalificaciones();
  } catch (error) {
    console.error(error);
    alert("Error al guardar la calificación");
  }
}

function manejarClickTabla(event) {
  const boton  = event.currentTarget;
  const id     = boton.dataset.id;
  const action = boton.dataset.action;

  if (action === "editar") {
    prepararEdicion(id);
  } else if (action === "eliminar") {
    eliminarCalificacion(id);
  }
}

async function crearCalificacion(calificacion) {
  const respuesta = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calificacion),
  });

  if (!respuesta.ok) {
    const body = await respuesta.json().catch(() => ({}));
    console.error("Error crear:", body);
    throw new Error("Error al crear calificación");
  }

  return await respuesta.json();
}

async function actualizarCalificacion(id, calificacion) {
  const respuesta = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(calificacion),
  });

  if (!respuesta.ok) {
    const body = await respuesta.json().catch(() => ({}));
    console.error("Error actualizar:", body);
    throw new Error("Error al actualizar calificación");
  }

  return await respuesta.json();
}

async function eliminarCalificacion(id) {
  const confirmar = confirm("¿Seguro que deseas eliminar esta calificación?");
  if (!confirmar) return;

  const respuesta = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

  if (!respuesta.ok) {
    const body = await respuesta.json().catch(() => ({}));
    console.error("Error eliminar:", body);
    throw new Error("Error al eliminar calificación");
  }

  await cargarCalificaciones();
}

async function prepararEdicion(id) {
  try {
    const respuesta = await fetch(API_URL);
    const calificaciones = await respuesta.json();
    const calificacion = calificaciones.find((c) => c._id === id);
    if (!calificacion) return;

    idEnEdicion             = calificacion._id;
    inputMatricula.value    = calificacion.matricula;
    inputNombre.value       = calificacion.nombre;
    inputMateria.value      = calificacion.materia;
    inputCalificacion.value = calificacion.calificacion;

    btnGuardar.textContent  = "Actualizar";
    inputMatricula.focus();
  } catch (error) {
    console.error("Error al preparar edición:", error);
  }
}

function obtenerValoresFormulario() {
  return {
    matricula:    Number(inputMatricula.value),
    nombre:       inputNombre.value.trim(),
    materia:      inputMateria.value.trim(),
    calificacion: Number(inputCalificacion.value),
  };
}

function validarCampos() {
  const mat = Number(inputMatricula.value);
  if (isNaN(mat) || mat <= 0) {
    inputMatricula.setCustomValidity(" ");
  } else {
    inputMatricula.setCustomValidity("");
  }

  if (inputNombre.value.trim().length === 0) {
    inputNombre.setCustomValidity(" ");
  } else {
    inputNombre.setCustomValidity("");
  }

  if (inputMateria.value.trim().length === 0) {
    inputMateria.setCustomValidity(" ");
  } else {
    inputMateria.setCustomValidity("");
  }

  const valor = Number(inputCalificacion.value);
  if (isNaN(valor) || valor < 0 || valor > 10) {
    inputCalificacion.setCustomValidity(" ");
  } else {
    inputCalificacion.setCustomValidity("");
  }
}

function limpiarFormulario() {
  formRegistro.reset();
  formRegistro.classList.remove("was-validated");
  idEnEdicion = null;
  btnGuardar.textContent = "Guardar";
}
