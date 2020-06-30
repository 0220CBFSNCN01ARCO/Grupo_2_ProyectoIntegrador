var express = require('express');
const fs = require ('fs');
const path = require('path');
const bcrypt = require('bcrypt')
const { check , validationResult , body } = require("express-validator")

let db = require("../database/models")
let sequelize = db.sequelize;

const usersPath = path.join(__dirname, '../data/users.json');
const usersList = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));

let usersController = {

    "login" : function(req,res){
        let userLogin = req.session.usurioLogueado
        if(userLogin == undefined){
            res.render("login");
        }else{
            res.render("profile",{userID : userLogin });
        }
    },
    
    "processLogin" : function(req,res,next){
        let errors = validationResult(req);

    
        db.User.findOne({
            include: [{association: "category"}],
            where:{
                email: req.body.email
            }
        }).then(usuario => {
            
            const validacion = bcrypt.compareSync(req.body.password, usuario.password)
            if(validacion){
                req.session.usurioLogueado = usuario
            }else{ 
                return res.render('login', { errors: [
                    {msg: "Invalid credentials"}
                ]});
                
            }
                if(req.body.remember != undefined){
                    res.cookie("remember", usuario.email , { maxAge : 60000} )
                }

               
                return res.redirect('/users/profile/' + usuario.id)

               

            

        }).catch(error =>{ 
            return res.render("login", { errors : errors.errors}) ;
           
        })
        
    
        /*
        if (errors.isEmpty()) {
            //Validamos que dentro del JSON se encuentren usuarios de no ser asi crea un array nuevo
            let users;
            if (usersList == ""){
                users = [];  
            }else{
                users = usersList
            }



            //buscamos el usuario que esta intentando loguearse
            for (let i = 0 ; i < users.length; i++){
                if (users[i].email == req.body.email){
                    if(bcrypt.compareSync(req.body.password, users[i].password)){
                        let usuarioAloguearse = users[i];

                        req.session.usurioLogueado = usuarioAloguearse

                        if(req.body.remember != undefined){
                            res.cookie("remember", usuarioAloguearse.email , { maxAge : 60000} )
                        }

                        res.redirect('users/profile/:id')

                        break;
                    }
                }
            }

            if (typeof(usuarioAloguearse) == "undefined"){
                return res.render("login", {errors : [
                    {msg: "Invalid credentials"}
                ]})
            }
        }else{
            return res.render("login", { errors : errors.errors}) ;
        }
        */
    },
    "profile" : function(req,res){
        const ID = req.session.usurioLogueado.id;

        db.User.findOne({
            include: [{association: "category"}],
            where:{
                id: ID
            }
            }).then((resultado) => {
                res.render("profile",{userID:resultado});

            })
            

        /*
        const userID = usersList.find( usersList => {
            return usersList.id == ID;
        })
        res.render("profile",{userID:userID});
        */
  
        
    },
        
    "userEdit" : function(req,res){
        const ID = req.session.usurioLogueado.id;
        db.User.findOne({
            include: [{association: "category"}],
            where:{
                id: ID
            }
            }).then((usuario) => {
                res.render("profileEdit",{userID : usuario, ID:ID});

            })
        

        /*
        const ID = req.session.usurioLogueado.id;
        const userID = usersList.find( usersList => {
            return usersList.id == ID;
        })
        res.render("profileEdit", {userID:userID, ID:ID})
        */
    },
    "editProfile" :  function(req,res,next){

        db.User.update({
                
                first_Name: req.body.First_name,
                last_Name: req.body.Last_name,
                email: req.body.Email,
                //se podria agregar la opcion de cambiar al cantreña
                //con un boton y quiere cambiar se modifique sino no

                //tampoco se puede cambiar la imagen
                
                
        },{
            where: {
                id: req.params.id
            }
        })
        res.redirect("/")

        /*
        const userId = req.params.id;

            usersList.map(user => {
            if(user.id ==  userId)
                user.id = user.id,
                user.first_name = req.body.First_name,
                user.last_name = req.body.Last_name,
                user.email = req.body.Email,
                user.password = bcrypt.hashSync(req.body.Password,10),
                user.avatar = req.files[0] ? req.files[0].filename : '',
                user.category = user.category
                
                })

        fs.writeFileSync('data/users.json', JSON.stringify(usersList));
        res.redirect("/users")
        */
    },
  
    "register" : function(req,res){
        res.render('register');
    } ,
    "bag" : function(req,res){
        res.render('productBag');
    },
    "create" : function(req,res,next){
        let errors = validationResult(req)
        
        console.log("ERRORESSS!!!!!!!!!!")
        console.log(errors)

        if (errors.isEmpty()){
            db.User.create({
                first_Name : req.body.First_name,
                last_Name : req.body.Last_name,
                email : req.body.Email,
                password : bcrypt.hashSync(req.body.Password,10),
                avatar : req.files[0] ? req.files[0].filename : "default.jpg",
                idCategories :  2

            })
           
            res.redirect("/users")

        }else{
            return res.render("register", { errors : errors.errors})
        }
        /*

        let errors = validationResult(req);

        let cont = usersList.length;
        let ID = cont + 1;

        if (errors.isEmpty()){
            let newUser = {
                id : ID,
                first_name : req.body.First_name,
                last_name : req.body.Last_name,
                email : req.body.Email,
                password : bcrypt.hashSync(req.body.Password,10),
                avatar : req.files[0] ? req.files[0].filename : "default.jpg",
                category : "false"
            }
            usersList.push(newUser);
            fs.writeFileSync('data/users.json', JSON.stringify(usersList));
    
            res.redirect("/users")

        }else{
            return res.render("register", { errors : errors.errors})
        }

        */
    },

    "userList": function(req,res){

        db.User.findAll({
            include: [{association: "category"}]
        })
            .then(function(usuarios){
                res.render("userList", { userList: usuarios });
            })

        // JSON res.render("userList", { userList: usersList });
    },

    "view": function(req,res,next){
        const id = req.params.id;
        db.User.findOne({
        include: [{association: "category"}],
        where:{
            id: id
        }
        }).then((usuario) => {
            res.render("usersView",{userID : usuario, ID: id});

        })
        console.log(id)
        /*
        const id = req.params.id;
        const userID = usersList.find( usersList => {
            return usersList.id == id;
        });
        res.render("usersView", { userID: userID, ID:id});
        console.log(id)
        */
    },

    "delete": function(req,res,next){
        let userID = req.params.id;

        let userIdDelete = usersList.filter(usersList =>{
            return usersList.id != userID;
        })
        let newusersList = JSON.stringify(userIdDelete,'utf-8');
        
        fs.writeFileSync(usersPath, newusersList);

        res.redirect("/users/list")
    },
    
    "editUser": function(req,res,next){

        const id = req.params.id;
        db.User.findOne({
        include: [{association: "category"}],
        where:{
            id: id
        }
        }).then((usuario) => {
            res.render("userEdit",{userID : usuario, ID: id});

        })

        /*const id = req.params.id;
        const userID = usersList.find( usersList => {
            return usersList.id == id;
        });
        res.render("userEdit", { userID: userID, ID:id});
        */
    },

      
    "edit": function(req,res,next){

        const userId = req.params.id;
        db.User.update({
            idCategories : req.body.category
        },{
            where: {
                id: userId
            }
        })

        res.redirect('/users/list');
        /*
       usersList.map(user => {
            if(user.id == userId)
                user.category = req.body.category
            })
                
        
        fs.writeFileSync('data/users.json', JSON.stringify(usersList));
        res.redirect('/users/list');
    
        */
        
    },


    "logout" : function(req,res,next){

        req.session.destroy();
        res.clearCookie("remember");

        res.redirect('/');
        
    },

    
    

};

module.exports = usersController;