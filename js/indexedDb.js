"use strict";

//Recebe a referência ao banco de dados IndexedDB
var database = '';

//Responsável por criar uma conexão como banco de dados. Se o banco de dados não existir ele será criado
function setup() {
  
  const dbName = "contacts";

  //Abrir Banco de dados
  //O primeiro parâmetro é o nome do banco de dados e o segundo parâmetro a versão
  //Nota: a versão não aceita valores do tipo float.  Se por exemplo usar algo deste tipo = 1.5,
  //a versão será convertida para 1.  Se por exemplo você já tiver uma versão 1 criada, neste caso o evento onupgradeneeded não será acionado.
  if(!database) {
    var open = window.indexedDB.open(dbName, "1");
    
    //Evento e erro
    //open.onerror = function(event) {
    //    console.log("Erro encontrado");
    // };
           
     //Evento de sucesso da operação
     open.onsuccess = function(event) {
        database = event.target.result;
        console.log("Banco de dados criado com sucesso => "+ database);
     };
           
     //onupgradeneeded é o único lugar onde você pode alterar a estrutura do banco. 
     //Nele você pode: criar, deletar objectStores. Construir ou remover índices.   
     
     open.onupgradeneeded = function(event) {
       
        var database = event.target.result;
      
        //Cria a estrutura de armazenamento para os contatos
        //Usamos keyPath como sendo o id do contato
        
        //Primeiro parâmetro deve ser o nome do objeto de armazenamento que vai conter os contatos
        //Segundo Parâmetro define como a chave deve se compartar.  
        //Nota: Para o segundo parâmetro podemos escolher entre dois tipos de chaves, usar os dois tipos ou deixar em branco
        //Tipo 1 = keypath - Exemplo: { keyPath : "cpf" } posso usar para definir que tenho uma chave única que deve ser informada em todas as operações.
        //Exemplo: cpf
        //Tipo 2 = keyGenerator (auto increment). Neste caso será criada uma chave autoincremental que será controlada automaticamente
        var objectStore = database.createObjectStore("contacts", { keyPath: "id", autoIncrement : true });
      
        //Cria um índice para buscar contatos pelo nome. Não teremos índice único, pois podemos ter nomes duplicados
        objectStore.createIndex("nome", "nome", { unique: false });
      
        //Cria um índice para buscar contatos por email. Também não teremos índice único
        objectStore.createIndex("email", "email", { unique: false });
        
        
     }
  }    
}


//Responsável por limpar(remover) os objetos armazenados na collection
function cleanIndexedDb() {
    
    //Transação
    var transaction = database.transaction(["contacts"], 'readwrite');
    
    //Objeto
    var objectStore = transaction.objectStore("contacts");
    
    //Requisição
    var request = objectStore.clear();
    
    //Limpeza realizada com sucesso
    request.onsuccess = function(event) {
      console.log("Limpeza IndexedDb realizada com sucesso");
    
    };
    
    
  
   
}


//Responsável por gravar cada contato na estrutura IndexedDb
function saveIndexedDb(contact) {
  
  //Desativa botão [salvar]
  var btnSalvar = document.getElementById('salvar');
  btnSalvar.disabled = true;
  
  //Nota: use as operações readwrite apenas quando necessário. As operações readonly podem ser executadas simultaneamente, 
  //já as que fazem alteração na base de dados não podem.
  var transaction = database.transaction(["contacts"], 'readwrite');
  
  var objectStore = transaction.objectStore("contacts");
  
  var request = objectStore.add(contact);

  //Se transação completada com sucesso ativa botão [Salvar]    
  request.onsuccess = function(event) {
    
    //event.target.result == contact.id;
    console.log("Contato Gravado =>", event.target.result);
    
    var item = [];
    contact.id = event.target.result;
    item.push(contact);
    
    console.log("contato Com Id => ", item);
    
    renderLine(item);
    
    //Simulando uma espera de 5 segundo antes de reativar o botão de gravar contato
    setTimeout(function(){  btnSalvar.disabled = false;  }, 5000);
    
  
  };  
  
  //Se ocorrer erro na transação, ativar novamente o botão salvar e exibir mensagem de erro no console
  //TODO: exibir mensagem de erro na tela do usuário
  transaction.onerror = function(event) {
    console.log("Erro ao Gravar Contato");
    btnSalvar.disabled = false;    
  }    
  
      
}

//Obter todos os contatos salvos.
//Usando  para obter os contatos
//Nota: Existe um método chamado getAll que pode ser usado como alternativa ao cursor. O getAll é mais performático
function getAllIndexedDb() {
  
 
  var contacts = [];
  
  //Transaction sem especificar o segundo parâmetro significa que o modo é readonly
  var transaction = database.transaction(["contacts"]);
  var objectStore = transaction.objectStore("contacts");
  
  //Abrindo Cursor
  var request = objectStore.openCursor();
  
  request.onsuccess =function(event) {
    
    //cursor recebe o primeiro contato armazenado
    var cursor = event.target.result;
    
    if (cursor) {
      contacts.push(cursor.value);
      console.log("Cursor Atual => ", cursor.value);
      //próximo contato armazenado
      cursor.continue();
    } else {
      console.info ("Não existem mais contatos para buscar!!!");
      renderAll(contacts);
    }
    
  }
  
  
}

function searchIndexedDb(term) {
  
  //Transaction sem especificar o segundo parâmetro significa que o modo é readonly
  var transaction = database.transaction(["contacts"]);
  var objectStore = transaction.objectStore("contacts");
  
  var index_1 = objectStore.index("nome");
  var index_2 = objectStore.index("email");
  
  var keyRange = IDBKeyRange.only(term);  
  
  var contactsByName = [];
  var contactsByEmail = [];
  
  //Abrindo Cursor
  //Eu poderia usar o método get, mas se tivermos mais de um contato o método vai pegar o de menor chave
  //Cursor vai retornar todos os contatos localizados
  var searchByName = index_1.openCursor(keyRange);
  
  searchByName.onsuccess = function(event) {
      
      var cursor = event.target.result;
      if (cursor) {
          contactsByName.push(cursor.value);            
          cursor.continue();
      } else {
           console.log("Contatos localizados por nome => ", contactsByName);
           
           var searchByEmail = index_2.openCursor(keyRange);
           
           searchByEmail.onsuccess = function(event) {
            
                var cursor = event.target.result;
                if (cursor) {
                    contactsByEmail.push(cursor.value);
                    cursor.continue();
                } else {
                  
                   console.log("Contatos localizados por email => ", contactsByEmail);
                  
                   //Transformar array (contendo contactsByName + contactsByEmail) para JSON array
                   let str = JSON.stringify(contactsByName.concat(contactsByEmail));
                   
                   //Retorna os itens únicos. Remove os repetidos.
                   let contacts = JSON.parse(str).filter((li, idx, self) => self.map(itm => itm.id).indexOf(li.id) === idx);
                  
                    console.info("Contatos localizados => ", contacts);
                    renderAll(contacts);
                }
               
           }
          
          //renderAll(contacts);
      }
  }
  
}

function removeIndexedDb(row, id) {
    
  var transaction = database.transaction(["contacts"], "readwrite");
  var objectStore = transaction.objectStore("contacts");
 
  var request = objectStore.delete(id);
  
  request.onsuccess = function(event) {
      console.log("Contato Removido com Sucesso");
      var i = row.parentNode.parentNode.rowIndex;
      console.log("Linha Removida => ", i);
      document.getElementById("contatos").deleteRow(i);
  }
 
 
}

//Se tiver um banco de dados aberto
if (database) {
  
  //Evento genérico para tratar os erros de todos os requests do banco IndexedDB!
  database.onerror = function(event) {
    alert("Erro encontrado: " + event.target.errorCode);
  };
}


