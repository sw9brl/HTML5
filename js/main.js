"use strict";

function selectDb(type) {
  
  //Limpar Db
  cleanDb(localStorage.getItem("db"));
  
  //Alteracao 19-10 - chamada iniDb
  //Init Db
  iniDb(type);
  
  localStorage.setItem("db", type);
  
  autoLoad();
  
   //Alteracao 19-10 - getAll comentado e inclusao de codigo para limpar grid
  //getAll(localStorage.getItem("db"));
  
  //Limpar Dados Tbody
  var table = document.getElementById("contatos").getElementsByTagName('tbody')[0];
  var tbodyNew = document.createElement('tbody');
  table.parentNode.replaceChild(tbodyNew, table);
    
  console.log("Tipo Selecionado => ", localStorage.getItem("db"));
}

function storageSetup() {
  
  if (!localStorage.db) 
    localStorage.setItem("db", "localStorage");
    
    //Você também poderia escrever assim: localStorage.db = "localStorage";
    return localStorage.getItem("db");
  
}

function autoLoad() {
  var dbSelected = document.getElementById('dbSelected');
  dbSelected.innerHTML = "Você está usando: " + storageSetup() + "&nbsp;&nbsp;&nbsp;<span class='glyphicon glyphicon-thumbs-up'></span>";
};

var searchEvt  = document.getElementById('search');

//Definição do evento de pesquisa
searchEvt.addEventListener("click", function (event) {
            
    var term = document.getElementById("filtro").value;
    
    //Chamando função de pesquisa que faz parte da camada de abstração - storage.js
    search(storageSetup(), term);
    
});

var loadEvt  = document.getElementById('loadAll');

//Definição do evento de pesquisa
loadEvt.addEventListener("click", function (event) {
            
   
    getAll(localStorage.getItem('db'));
    
});

//Remove contato da grid
function removeContact(row, id) {
     
    //TODO - Remover contato do armazenamento local
    if(localStorage.getItem("db") == 'indexedDb') {
      console.log("row => ", row);
      console.log("row => ", id);
      removeIndexedDb(row, id);
    } else if (localStorage.getItem("db") == 'idbx') {
      console.log(id);
      removeIdbx(row, id);
    } else if (localStorage.getItem("db") == 'idbp') {
      removeIdbp(row, id);
    }else {
      var i = row.parentNode.parentNode.rowIndex;
      console.log("Linha Removida => ", i);
      document.getElementById("contatos").deleteRow(i);
   
    }
    
}


