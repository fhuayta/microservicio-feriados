'use strict'
const express=require('express');
const app=express();
//const _=require('underscore');
const {
  fechaInicial,
  listarFeriados,
  busquedaTiempo,
  crearFecha,
  modificarFecha,
  eliminarFecha,
  comprobarStatus,
  sumarDias,
  compararDias,
  fechaActual,
  restarFechas
} = require('../controller/feriado')

//===========================
// Lista de Feriados
//===========================
app.get('/api/v1/feriados',listarFeriados);

//==============================
// Lista de Feriados por gestion
//==============================
app.get('/api/v1/feriados/fecha',busquedaTiempo);

//==============================
// Busqueda por gestion y mes
//==============================
app.get('/api/v1/feriados/fecha',busquedaTiempo);

//==============================
// Busqueda por gestion, mes y dia
//==============================
app.get('/api/v1/feriados/fecha',busquedaTiempo);

//=====================================
// Generacion del calendario por gestion
//=====================================
app.post('/api/v1/feriados/gestion',fechaInicial);

//=====================================
// Generacion de la gestion en cero
//=====================================
app.post('/api/v1/feriados/gestion',fechaInicial);

//==========================
// Crear una Fecha
//==========================
app.post('/api/v1/feriados',crearFecha);
//==========================
// Modificar una fecha
//===========================
app.put('/api/v1/feriados/modificar',modificarFecha);
//==========================
// Borrar un Feriado
//==========================
app.delete('/api/v1/feriados/borrar',eliminarFecha);

//==========================
// 	Comprobar status de la API
//==========================

app.get('/api/v1/status',comprobarStatus)

// Suma dias a una fecha indicada
app.get('/api/v1/fechas/:dias', sumarDias);

// Verifica si entre 2 fechas existe una cantidad de dias especificada
app.get('/api/v1/fechas', compararDias);

// Devuelve la fecha actual del servidor
app.get('/api/v1/fecha-actual', fechaActual);

// Devuelve la diferencia entre dos fechas dadas
app.get('/api/v1/fechas/restar/fechas', restarFechas);

module.exports=app;