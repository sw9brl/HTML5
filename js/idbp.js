function cleanIdbp () {
    
    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let promise = idb.open('contactsIdbp', 1);

    promise.then(db => {
        
        let transaction = db.transaction('contact', 'readwrite');
        let objectStore = transaction.objectStore('contact');

        //Usando método clear
        let request = objectStore.clear();

        return transaction.complete;
    }).then(tx => {
        console.log("Limpeza Realizada com sucesso");
       
    }).catch((err) => {
        console.log("Operação de Limpeza Falhou", err);
    })

}

function iniIdbp () {
     
     //Parâmetros open:  1- Nome do Banco, 2- Versão, 3- upgradeDB (callBack - similar ao onupgradeneeded)
    let promise = idb.open('contactsIdbp', 1, 
            upgradeDB => { 
                
                let objectStore = upgradeDB.createObjectStore('contact', { keyPath: "id", autoIncrement: true })
                
                 //Cria um índice para buscar contatos pelo nome. Não teremos índice único, pois podemos ter nomes duplicados
                objectStore.createIndex("nome", "nome", { unique: false });
              
                //Cria um índice para buscar contatos por email. Também não teremos índice único
                objectStore.createIndex("email", "email", { unique: false });
            }
                
        );
        
    promise.then(db => {
       console.log("idbp inicializado com sucesso =>", db);
       db.close();
    }).catch(() => {
        console.log("Inicialização Falhou");
    })    
        
}

function saveIdbp (contact) {

     //Desativa botão [salvar]
     let btnSalvar = document.getElementById('salvar');
     btnSalvar.disabled = true;
    
    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let promise = idb.open('contactsIdbp', 1);

    promise.then(db => {
        
        let transaction = db.transaction('contact', 'readwrite');
        let objectStore = transaction.objectStore('contact');

        //Método add para adicionar contato
        let request = objectStore.add(contact);
        
        //Transação completada com sucesso eu devolvo o resultado do request (id do contato gravado)
        return transaction.complete.then(() => request );
        
    }).then((idContato) => {

        console.log("Contato criado com sucesso => ", idContato);
        //Ativando o botão Salvar
        btnSalvar.disabled = false;
         
        let item = [];
        contact.id = idContato;
        item.push(contact);
        
        console.log("Contato Gravado =>", contact);
        
        //Exibe contato adicionado na grid (data table)
        renderLine(item);
       

    }).catch((err) => {
        console.log("Erro ao gravar contato =>", err);
        //Ativando o botão Salvar
        btnSalvar.disabled = false;
    
    })

}

function getAllIdbp () {
    
    let promise = idb.open('contactsIdbp', 1);

    promise.then(db => {
        
        //Inibindo o segundo parâmetro o método transaction assume que a operação também é readonly
        let transaction = db.transaction('contact', 'readonly');
        let objectStore = transaction.objectStore('contact');

        //Operações possíveis: add, put, delete, count, clear, get, getAll, getAllKeys, getKey
        //CallBack contendo os contatos retornados
        return objectStore.getAll();

    }).then(contacts => {
        
         console.log("Contatos Retornados => ", contacts);

        //Exibe os contatos na grid (data table)
        renderAll(contacts);
    
        
    }).catch((err) => {
        console.log("Erro ao listar contatos =>", err);
    })

}

function searchIdbp (term) {
  
     
  let promise = idb.open('contactsIdbp', 1);

   promise.then(db => {
       
       //Usando IDBKeyRange
       let filter = IDBKeyRange.only(term);
  
       //Transaction sem especificar o segundo parâmetro significa que o modo é readonly
       let transaction = db.transaction("contact");
       let objectStore = transaction.objectStore("contact");
      
       //Capturando os índices para usarmos na busca
       let index_1 = objectStore.index("nome");
       let index_2 = objectStore.index("email");
  
       var contactsByName = [];
       var contactsByEmail = [];
      
       /*
        Uso do iterateCursor em alternativa ao openCursor, pois a navegação no cursor usando promise é um pouco instável devido
        a compatibilidade dos navegadores 
       */
      
       //Neste caso o cursor vai retornar todos os contatos com base no filtro
       let searchByName =  index_1.iterateCursor(filter, cursor => {
          
          if (!cursor) return;
          
          contactsByName.push(cursor.value);   
          cursor.continue();
       });
      
      //Neste caso o cursor vai retornar todos os contatos com base no filtro
      let searchByEmail = index_2.iterateCursor(filter, cursor => {
          
          if (!cursor) return;
          
          contactsByEmail.push(cursor.value);   
          cursor.continue();
      });  
      
      //Transação completa devolve o resultado da pesquisa
      return transaction.complete.then(() => {
           //Transformar array (contendo contactsByName + contactsByEmail) para JSON array
          let str = JSON.stringify(contactsByName.concat(contactsByEmail));
          return str;
      });
      
  
  }).then((contactsFound) => {
      
       
      console.log("Lista => ", contactsFound);
       
      //Retorna os itens únicos. Remove os repetidos.
      let contacts = JSON.parse(contactsFound).filter((li, idx, self) => self.map(itm => itm.id).indexOf(li.id) === idx);
      
      console.info("Contatos localizados => ", contactsFound);
      renderAll(contacts);
  
  }).catch((err) => {
      console.log("Erro Encontrado", err);
  });

  
}

function removeIdbp (row, id) {


    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let promise = idb.open('contactsIdbp', 1);

    promise.then(db => {
        
        let transaction = db.transaction('contact', 'readwrite');
        let objectStore = transaction.objectStore('contact');
        
        //Usando o método put que serve tanto para adicionar como para atualizar um objeto dentro do objectStore
        let request = objectStore.delete(id);
        
        return transaction.complete.then(() => id);
        
    }).then((idContato) => {
        
        console.log("Contato Removido => ", idContato);
        var i = row.parentNode.parentNode.rowIndex;
        document.getElementById("contatos").deleteRow(i);
        
    }).catch((err) => {
        
        console.log("Erro ao remover contato =>", err);
    })


}