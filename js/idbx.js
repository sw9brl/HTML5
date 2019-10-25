async function iniIdbx () {
     
     //Parâmetros open:  1- Nome do Banco, 2- Versão, 3- upgradeDB (callBack - similar ao onupgradeneeded)
    let database = await idb.open('contactsIdbx', 1, 
            upgradeDB => { 
                
                let objectStore = upgradeDB.createObjectStore('contact', { keyPath: "id", autoIncrement: true })
                
                 //Cria um índice para buscar contatos pelo nome. Não teremos índice único, pois podemos ter nomes duplicados
                objectStore.createIndex("nome", "nome", { unique: false });
              
                //Cria um índice para buscar contatos por email. Também não teremos índice único
                objectStore.createIndex("email", "email", { unique: false });
            }
                
        )
        
    database.close();
        
}


async function cleanIdbx () {
    
    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let database = await idb.open('contactsIdbx', 1);

    let transaction = database.transaction('contact', 'readwrite');
    let objectStore = transaction.objectStore('contact');

    //Usando método clear
    let request = await objectStore.clear();

    await transaction.complete;

    database.close();

}


async function saveIdbx (contact) {

     //Desativa botão [salvar]
     let btnSalvar = document.getElementById('salvar');
     btnSalvar.disabled = true;
    
    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let database = await idb.open('contactsIdbx', 1);

    let transaction = database.transaction('contact', 'readwrite');
    let objectStore = transaction.objectStore('contact');

    //Usando o método put que serve tanto para adicionar como para atualizar um objeto dentro do objectStore
    let request = await objectStore.put(contact);

    await transaction.complete;
    
    //Ativando o botão Salvar
    btnSalvar.disabled = false;
    
    let item = [];
    contact.id = request;
    item.push(contact);
    
    console.log("contato Com Id => ", request);
    
    //Exibe contato adicionado na grid (data table)
    renderLine(item);
    
    database.close();

}

async function getAllIdbx () {
    
    let database = await idb.open('contactsIdbx', 1);

    //Inibindo o segundo parâmetro o método transaction assume que a operação também é readonly
    let transaction = database.transaction('contact', 'readonly');
    let objectStore = transaction.objectStore('contact');

    //Operações possíveis: add, put, delete, count, clear, get, getAll, getAllKeys, getKey
    let contacts = await objectStore.getAll();

    console.log("Contatos Retornados => ", contacts);

    //Exibe os contatos na grid (data table)
    renderAll(contacts);

    database.close();

}

async function searchIdbx (term) {
    
  let database = await idb.open('contactsIdbx', 1);

  //Transaction sem especificar o segundo parâmetro significa que o modo é readonly
  let transaction = database.transaction("contact");
  let objectStore = transaction.objectStore("contact");
  
  let index_1 = objectStore.index("nome");
  let index_2 = objectStore.index("email");
  
  //Usando IDBKeyRange
  let filter = IDBKeyRange.only(term);
  
  var contactsByName = [];
  var contactsByEmail = [];
  
  
  //Eu poderia usar o método get, mas se tivermos mais de um contato o método vai pegar o de menor chave
  //Cursor vai retornar todos os contatos localizados na coluna nome com base no filtro informado 
  let searchByName = await index_1.iterateCursor(filter, cursor => {
      
      if (!cursor) return;
      
      contactsByName.push(cursor.value);   
      cursor.continue();
  });
  
  //Cursor vai retornar todos os contatos localizados na coluna email com base no filtro informado 
  let searchByEmail = await index_2.iterateCursor(filter, cursor => {
      
      if (!cursor) return;
      
      contactsByEmail.push(cursor.value);   
      cursor.continue();
  });
  
  await transaction.complete;
  
  console.log("Contatos localizados por nome => ", contactsByName);
    
  console.log("Contatos localizados por Email => ", contactsByEmail);
  

  //Transformar array (contendo contactsByName + contactsByEmail) para JSON array
  let str = JSON.stringify(contactsByName.concat(contactsByEmail));
   
  //Retorna os itens únicos. Remove os repetidos.
  let contacts = JSON.parse(str).filter((li, idx, self) => self.map(itm => itm.id).indexOf(li.id) === idx);
  
  console.info("Contatos localizados => ", contacts);
  renderAll(contacts);
     
  database.close();     
    
}

async function removeIdbx (row, id) {


    //Parâmetros open:  1- Nome do Banco, 2- Versão
    let database = await idb.open('contactsIdbx', 1);

    let transaction = database.transaction('contact', 'readwrite');
    let objectStore = transaction.objectStore('contact');

    //Usando o método put que serve tanto para adicionar como para atualizar um objeto dentro do objectStore
    let request = await objectStore.delete(id);

    await transaction.complete;
    
    console.log("Contato Removido => ", request);
    var i = row.parentNode.parentNode.rowIndex;
    document.getElementById("contatos").deleteRow(i);
    
    database.close();

}