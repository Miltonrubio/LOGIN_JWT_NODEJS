const jwt = require("jsonwebtoken")
const bcryptjs = require("bcryptjs")

const conexion = require("../database/db")
const { isEmpty } = require('validator');
const { promisify } = require("util")
const { title } = require("process")
const { error } = require("console")

exports.registrarDatos = async (req, res) => {

    try {

        const name = req.body.name
        const celular = req.body.celular
        const pass = req.body.pass

        console.log(name + " " + celular + " " + pass)

        let passHash = await bcryptjs.hash(pass, 8)
        console.log("Contraseña encriptada : " + passHash)

        conexion.query("INSERT INTO usuarios SET ?", { nombre: name, tel: celular, clave: pass }, (error, results) => {
            if (error) {
                console.log(error)
            }
            res.redirect("/")
        })

    } catch (error) {
        console.log("Error: " + error)
    }

}




exports.validarLogin = async (req, res) => {

    try {

        const celular = req.body.celular
        const pass = req.body.pass


        /*
        let passHash = await bcryptjs.hash(pass, 8)
        console.log("Contraseña encriptada : " + passHash)

        
                conexion.query("INSERT INTO usuarios SET ?", { nombre: name, tel: celular, clave: pass }, (error, results) => {
                    if (error) {
                        console.log(error)
                    }
                    res.redirect("/")
                })
                */

        if (isEmpty(celular) || isEmpty(pass)) {
            res.render("login", {
                data: {
                    alert: true,
                    alertTitle: "Advertencia",
                    alerMessage: "Ingresa los datos completos",
                    alertIcon: "info",
                    showConfirmButton: true,
                    timer: false,
                    ruta: "login"
                }
            })


            console.log("No hay datos")

        } else {


            console.log(celular + " " + pass)

            conexion.query("SELECT * FROM usuarios WHERE tel = ?", [celular], async (error, results) => {
                if (results.length == 0) {
                    /* || !(await bcryptjs.compare(pass, results[0].pass)) */
                    res.render("login", {

                        data: {
                            alert: true,
                            alertTitle: "Advertencia",
                            alerMessage: "Los datos ingresados son incorrectos",
                            alertIcon: "info",
                            showConfirmButton: true,
                            timer: false,
                            ruta: "login"
                        }
                    })
                } else {
                    const ID = results[0].ID
                    const nombre = results[0].nombre
                    const token = jwt.sign({ ID: ID }, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_TIEMPO_EXPIRA,

                    })

                    console.log("TOKEN " + token + " para el USUARIO: " + nombre)


                    const cookiesOptions = {
                        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly: true
                    }

                    res.cookie('jwt', token, cookiesOptions)

                    res.render("login", {

                        data: {
                            alert: true,
                            alertTitle: "BIENVENIDO !",
                            alerMessage: "Es un placer tenerte de nuevo por aqui",
                            alertIcon: "success",
                            showConfirmButton: false,
                            timer: 800,
                            ruta: ""
                        }
                    });


                }


            })
        }


    } catch (error) {
        console.log("Error: " + error)
    }

}


exports.estaLogeado = async (req, res, next) => {

    console.log("Paso por el autenticador")
    if (req.cookies.jwt) {
        try {
            const decodifciada = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            conexion.query("SELECT * FROM usuarios WHERE ID = ?", [decodifciada.ID], (error, results) => {
                if (!results || results.length === 0) {
                    return next();
                }
                req.usuarios = results[0];
                return next();
            });

        } catch (error) {
            console.log("Error " + error)
            return next()
        }

    } else {
        console.log("Sin usuario ")

        res.redirect("login")
    }

}



exports.logout = (req, res) => {
    res.clearCookie("jwt")
    console.log("Se cerro la sesion")
    return res.redirect("login");
}