## Modo de funcionamiento

Para el funcionamiento de la aplicacion tenemos las siguientes rutas:

## Listar Fecha

Con esta funcion GET nosotros podemos listar todas ñas fechas agregadas.

    http://localhost:3000/api/v1/feriados

.. Nota: Una fecha puede tener mas de una celebracion. Para agregar mas de una celebracion debe colocar una coma entre cada celebracion.

## Agregar Fecha

Con este método podemos visualizar las fechas de forma generica.

    POST http://localhost:3000/api/v1/feriados

Se deben agregar los siguientes campos:

    * fecha. La fecha del feriado

    * motivo. El motivo o feriado que se esta celebrando en esa fecha.

Ejemplo de body JSON que debe enviarse

```json
{
    "fecha": "2021-10-15",
    "motivo": "Dia de la victoria"
}
```


## Modificar una Fecha

Con este método podemos modificar una fecha.

    PUT http://localhost:3000/api/v1/feriados/modificar

Donde se puede modificar el motivo de la fecha.

## Busqueda de una Fecha

Con esta funcion GET podemos hacer la busqueda de una fecha

    GET http://localhost:3000/api/v1/feriados/dia

Parametros en entrada:

    *anio. Año

    *mes. Mes

    *dia. Dia

Se debe colocar en ese orden los paranetros

## Busqueda por Gestion y Mes

Con esta funcion GET podemos buscar los feriados por la gestion y por mes 

    http://localhost:3000/api/v1/feriados/mes'

Parametros en entrada:

    *anio. Año

    *mes. Mes

Se debe colocar en ese orden los paranetros

## Listar Calendario por Gestion

Con esta funcion GET podemos visualizar todo el calendario de feriados de toda una gestion, poniendo como parametro el año.

    http://localhost:3000/api/v1/feriados/anio

Parametros en entrada:

    *anio . Año

## Dar de Baja una Fecha   

Con esta funcion DELETE hacemos el borrado de una fecha. Manejamos una variable public para hacer que nuestra fecha sea visible. Si modificamo esa variable entonces esta solo se hara no publica.

    http://localhost:3000/api/v1/feriados/borrar

## Generar Calendario por Gestion

Esta funcion POST es la mas bonita. Con esta generamos el calendario de toda una gestion colocando como parametro de entrada el año en cuestion.

    http://localhost:3000/api/v1/feriados/gestion

donde debemos introducir estos parametros:

    *anio. Es el año de la gestion que queremos generar.

## Crear una Gestion en Cero

Con esta funcion  POST podemos crar una gestion sin feriados.

    http://localhost:3000/api/v1/feriados/gestion

donde debemos introducir estos parametros:

    *anio. Es el año de la gestion que queremos generar.

    *vacio. Se debe colocar true para que generemos el calendario vacio.

## Listar Gestiones

Con esta funcion GET podemos visualizar todas las gestiones.

    http://localhost:3000/api/v1/feriados/anio

## Borrar Toda una gestion

Con esta funcion DELETE podemos borrar toda una gestion, incluido el año y sus feriados respectivos.

    http://localhost:3000/api/v1/feriados/gestion


## Status

Esta funcion nos muestra si la api esta disponible o no

    http://localhost:3000/api/v1/status
