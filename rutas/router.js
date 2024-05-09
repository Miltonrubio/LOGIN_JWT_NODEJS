const express = require("express")
const  router  = express.Router()


const AuthController =  require("../controllers/AuthController")


//const conexion = require ("../database/db")

//rutas para las vistas

router.get("/", AuthController.estaLogeado, (req, res) =>{
  //  conexion.query()
    res.render("index")
})


router.get("/login", (req, res) => {
    res.render("login", {
        data: {
            alert: false
        }
    });
});


router.get("/registro", (req, res) =>{
    res.render("registro", {
        data: {
            alert: false
        }
    });
})






//rutas para los controladores

router.post("/registrarDatos", AuthController.registrarDatos)
router.post("/validarLogin", AuthController.validarLogin)
router.get("/logout", AuthController.logout)


module.exports = router