"use strict";
//Metodo openDatabase -> parâmetros: 1 = nome da base de dados, 2 = versão, 3 = descrição, 4 = tamanho, 5 = callback de sucesso (opcional) 
const db = openDatabase('contacts', '1.0', 'Armazena a lista de contatos', 2 * 1024 * 1024); //bytes 

//Inicializar armazenamento
function iniDb(type) {
  
    //Se for localStorage
    if (type == "localStorage") {
        if (!localStorage.getItem("contacts")) 
            localStorage.setItem("contacts", JSON.stringify([]));

    }
    
     //Se for sessionStorage
     if (type == "sessionStorage") {
        if (!sessionStorage.getItem("contacts")) 
            sessionStorage.setItem("contacts", JSON.stringify([]));
     }      
           
    
    
    if (type == "webSQL") {
        
        //Cria uma transação
        db.transaction(function(tx) {
            
          //Usando o método executeSql para criar uma tabela
          tx.executeSql("CREATE TABLE IF NOT EXISTS " +
            "contacts(id integer primary key asc, nome string not null, email string not null, telefone string)",
                     
            [],
            function() { console.log("Tabela Contacts Criada Com Sucesso"); }
          );
        
            
        });
        
       
    }
    
    if (type == "indexedDb") {
      setup();
    }
    
    if (type == "idbx") {
      iniIdbx();
    }
    
    if (type == "idbp") {
      iniIdbp();
    }
    
}


function cleanDb(type) {
  
//Remover a lista de contatos usando removeItem
//Outra alternativa seria usar localStorage.clear(), neste caso toda a estrutura de armazenamento local seria removida    
    if (localStorage.getItem("contacts"))
         localStorage.removeItem("contacts");
         
    if (sessionStorage.getItem("contacts"))
         sessionStorage.removeItem("contacts");
         
    //Web SQL Database
    //Verificar se existem contatos gravados
    if (type == "WebSQL") 
      removeWebSQL();
    
    
    //IndexedDb
    //Remove todos os dados do objectStore
    if(type == "indexedDb") 
      cleanIndexedDb();
    
    if(type == "idbx")
      cleanIdbx();
      
    if(type == "idbp")
      cleanIdbp();
      
      
}

//Salvar Contato
function save(type, contact) {
  
  //iniDb(type);
  
  if (type == "localStorage") {
      var contacts = JSON.parse(localStorage.getItem("contacts"));
      contacts.push(contact);
      localStorage.setItem("contacts", JSON.stringify(contacts));
      
      console.log("Contato Salvo =>", JSON.parse(localStorage.getItem("contacts")));
      
      var item = [];
      item.push(contact);
      
      renderLine(item);
  }  
  
  if (type == "sessionStorage") {
      var contacts = JSON.parse(sessionStorage.getItem("contacts"));
      contacts.push(contact);
      sessionStorage.setItem("contacts", JSON.stringify(contacts));
      
      console.log("Contato Salvo =>", JSON.parse(sessionStorage.getItem("contacts")));
      
      var item = [];
      item.push(contact);
      
      renderLine(item);
  }  
  
  if (type == "webSQL") {
      
      db.transaction(function(tx) {
          //Poderia realizar insert assim também: tx.executeSql('INSERT INTO contacts (nome, email, telefone) VALUES ("paulo", "aa@ig.com.br", "+99(99)9999-9999")'); 
          tx.executeSql(
             
            "INSERT INTO contacts (nome, email, telefone) values (?,?,?);",
            [contact.nome, contact.email, contact.telefone],
            function() { 
                var item = [];
                item.push(contact);
                renderLine(item);
                console.log("Contato gravado com sucesso => ", contact); },
            function() { console.log("Erro ao gravar contato"); }
          );
        });
  }
  
  if (type == "indexedDb") 
    saveIndexedDb(contact);
  
  
  if (type == "idbx")
    saveIdbx(contact);
    
  if (type == "idbp")
    saveIdbp(contact);
  
}

//Traz todos os contatos salvos na estrutura de armazenamento
function getAll(type) {
  
  //iniDb(type);
  
  if (type == "localStorage") {
      var contacts = JSON.parse(localStorage.getItem("contacts"));
      renderAll(contacts);
  }  
  
  if (type == "sessionStorage") {
      var contacts = JSON.parse(sessionStorage.getItem("contacts"));
      renderAll(contacts);
  }  
  
  if (type == "webSQL") {
      
      var contacts = [];
      
      db.transaction(function(tx) {
      tx.executeSql(
        "SELECT * FROM contacts",
        [],
        function(tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
            contacts.push(results.rows.item(i));
          }
          console.log("web Sql | Contatos => ", contacts);
          renderAll(contacts);
        },
        function() { console.log("Erro ao buscar contatos"); }
      );
    });
  }
  
  if (type == "indexedDb") {
    getAllIndexedDb();
  }
  
  if (type == "idbx") {
    getAllIdbx();
  }
  
  if (type == "idbp") {
    getAllIdbp();
  }
  
}

//Pesquisa na estrutura pelo termo digitado pel usuário e retornar os contatos correspondentes
function search(type, term) {
  
  //iniDb(type);

  var contactsFound = [];
  var contacts;        
    
  if (type == "localStorage") {    
      contacts = JSON.parse(localStorage["contacts"]);
      
      contacts.forEach(function(contact) {
          if(contact.nome == term || contact.email == term) {
              contactsFound.push(contact);
          }
      })
      
      renderAll(contactsFound);
  }
  
  if (type == "sessionStorage") {    
      contacts = JSON.parse(sessionStorage["contacts"]);
      
      contacts.forEach(function(contact) {
          if(contact.nome == term || contact.email == term) {
              contactsFound.push(contact);
          }
      })
      
      renderAll(contactsFound);
  }
  
  if (type == "webSQL") {
      
      db.transaction(function(tx) {
      tx.executeSql(
        "SELECT * FROM contacts WHERE nome = ? OR email = ?",
        [term, term],
        function(tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
            contactsFound.push(results.rows.item(i));
          }
          console.log("web Sql | Contatos encontrados => ", contactsFound);
          renderAll(contactsFound);
        },
        function() { console.log("Erro ao buscar contatos"); }
      );
    });
  }
  
  if (type == "indexedDb") {
    searchIndexedDb(term);
  }
  
   if (type == "idbx") {
    searchIdbx(term);
  }
  
  if (type == "idbp") {
    searchIdbp(term);
  }
}

function renderLine(contact) {
    
    var table = document.getElementById("contatos").getElementsByTagName('tbody')[0];

    //Criar linha e colunas no final da tabela de dados
    contact.forEach(function(item) {
      
        var newRow  = table.insertRow(table.rows.length);
        
        var newCell_1  = newRow.insertCell(0);
        var newCell_2  = newRow.insertCell(1);
        var newCell_3  = newRow.insertCell(2);
        var newCell_4  = newRow.insertCell(3);
        
        var nome  = document.createTextNode(item["nome"]);
        var email  = document.createTextNode(item["email"]);
        var telefone  = document.createTextNode(item["telefone"]);

        newCell_1.appendChild(nome);
        newCell_2.appendChild(email);
        newCell_3.appendChild(telefone);
        
          //Incluindo o id quando usamos indexeddb
        var param =  item["id"] ? item["id"] : '';

        newCell_4.innerHTML = "<button type='button' onclick='removeContact(this, " + param + ")' class='btn btn-danger btn-xs'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>";
      
        console.log(item["nome"], item["email"], item["telefone"]);  
    });
}


function renderAll(contacts) {
    

    //Limpar Dados Tbody
    var table = document.getElementById("contatos").getElementsByTagName('tbody')[0];
    var tbodyNew = document.createElement('tbody');
    table.parentNode.replaceChild(tbodyNew, table);
    
    var table = document.getElementById("contatos").getElementsByTagName('tbody')[0];
   
    //Criar linhas e colunas na tabela de contatos
    contacts.forEach(function(item) {
      
        var newRow  = table.insertRow(table.rows.length);
        
        var newCell_1  = newRow.insertCell(0);
        var newCell_2  = newRow.insertCell(1);
        var newCell_3  = newRow.insertCell(2);
        var newCell_4  = newRow.insertCell(3);
        
        var nome  = document.createTextNode(item["nome"]);
        var email  = document.createTextNode(item["email"]);
        var telefone  = document.createTextNode(item["telefone"]);
        
        newCell_1.appendChild(nome);
        newCell_2.appendChild(email);
        newCell_3.appendChild(telefone);
        
        //Incluindo o id quando usamos indexeddb
        var param =  item["id"] ? item["id"] : '';
        
        newCell_4.innerHTML = "<button type='button' onclick='removeContact(this, " + param + ")' class='btn btn-danger btn-xs'><span class='glyphicon glyphicon-remove' aria-hidden='true'></span></button>";
      
        console.log(item["nome"], item["email"], item["telefone"]);  
    });
    
}

function removeWebSQL() {
  
  //iniDb(type);
  
      db.transaction(function(tx) {
          tx.executeSql(
            "SELECT COUNT(*) FROM contacts;",
            [],
            function(tx, results) {
              console.log("web Sql | Count => ", results.rows.item(0)["COUNT(*)"]);
              if(results.rows.item(0)["COUNT(*)"] > 0) {
         
                db.transaction(function(tx) {
                  tx.executeSql(
                    "DELETE from contacts ", [],
                    function() { console.log("Contatos removidos com sucesso"); },
                    function() { console.log("Erro ao remover contatos"); }
                  );
                });
             }
    
            },
            function() { console.log("Erro ao contar"); }
          );
    });
  
}
