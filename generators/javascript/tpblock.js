

Blockly.JavaScript['extractor'] = function(block) {
  var value_line = Blockly.JavaScript.valueToCode(block, 'line', Blockly.JavaScript.ORDER_ATOMIC);
  var value_file = Blockly.JavaScript.valueToCode(block, 'file', Blockly.JavaScript.ORDER_ATOMIC);
  // Blockly.JavaScript.variables.push('protected final Marker line  = new Marker();\n');
  // Blockly.JavaScript.variables.push('protected String currentFileName;\n');
  var code ='';
  if(value_line !== "") {
    code += value_line.replace('$$', "line");
  }
  if(value_file !== "") {
    code += value_file.replace('$$', "fileName");
  }
  Blockly.JavaScript.extractPhase = code;
  // console.log('extractor',code)
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['output_field'] = function(block) {
  var code = block.getFieldValue('NAME') || null;
  // TODO: Assemble JavaScript into code variable.
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

Blockly.JavaScript['delimiter'] = function(block) {
  if (!block.validate) {
    return false;
  }
  var text_delim = block.getFieldValue('delim');
  var chars = text_delim.split('');
  var ascii = 'token_';
  var code;
  chars.forEach(function(c) {
    ascii += c.charCodeAt(0);
  });
  var escapeMatch = text_delim.match(/(\\t|\\b|\\n|\\r|\\f|\'|\"|\\)/g); 
  if(escapeMatch){ text_delim = '\\'+text_delim} 

  var token = 'private byte[] ' + ascii + '= "'+text_delim+'".getBytes();\n';
  var childCol = [];
  var childVar = [];
  var childCode = [];
  block.inputList.forEach(function(input){
    if(input.connection && input.connection.targetConnection){
      var getChildCode = Blockly.JavaScript.valueToCode(block, input.name, Blockly.JavaScript.ORDER_ATOMIC);
      getChildCode = getChildCode.split('|$|');
      childVar.push('m'+getChildCode[0])
      childCol.push(getChildCode[1]);
      childCode.push(getChildCode[2]);
    }    
  })
    childCol = childCol.join(',');
    childVar = childVar.length > 0 ? ','+childVar.join(',') : ''; 
    code = '$$.splitAndGetMarkers(data,'+ascii+',new int[]{'+childCol+'},mf'+childVar+');\n';
    code+=childCode.join('');

  if (Blockly.JavaScript.variables.indexOf(token) == -1) {
    Blockly.JavaScript.variables.push(token);
  }
  return [code, Blockly.JavaScript.ORDER_ATOMIC];

};



Blockly.JavaScript['field_extractor'] = function(block) {
  if (!block.validate) {
    return false;
  }
  var number_get = block.getFieldValue('get');
  var code;
  var dropdown_operation = block.getFieldValue('operation');
  var variable_marker = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  //this shouldnot be 'f'
  // and should be unique
  var childCode = Blockly.JavaScript.valueToCode(block, 'next_marker', Blockly.JavaScript.ORDER_ATOMIC);
  childCode = childCode.replace("$$", 'm'+variable_marker);
  
  // var currBlockCode = "$$.splitAndGetMarker(data,[$],int[]{1,2}"+number_get+', mf);\n';
  // code = currBlockCode + childCode;
  code= variable_marker+'|$|'+number_get+'|$|'+childCode;
 
  Blockly.JavaScript.initFunctions.push('m'+variable_marker+' = mf.create(0, 0);\n');

  var marker = 'private Marker m' + variable_marker + ';\n';
  if (Blockly.JavaScript.variables.indexOf(marker) == -1) {
    Blockly.JavaScript.variables.push(marker);
  }
  

  // Blockly.JavaScript.variables.push('protected Marker m' + variable_marker + ';\n');
  // Blockly.JavaScript.variables.push('protected byte[] ' + ascii + '= "'+text_delim+'".getBytes();\n');
  // var code = '.splitAndGetMarker(data, '+ ascii+', '+number_get+', mf);\n ';
  // console.log('field_extractor',code);
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};


Blockly.JavaScript['transform'] = function(block) {
  var statements_name = Blockly.JavaScript.statementToCode(block, 'NAME');
  // TODO: Assemble JavaScript into code variable.
  var code = statements_name;
  Blockly.JavaScript.translatePhase = code;
  return [code, Blockly.JavaScript.ORDER_ATOMIC];
};

// Blockly.JavaScript['store'] = function(block) {
//   var dropdown_operation = block.getFieldValue('operation');
//   var text_path = block.getFieldValue('path');
//   var value_list_to_store = Blockly.JavaScript.valueToCode(block, 'list_to_store', Blockly.JavaScript.ORDER_ATOMIC);
//   var checkbox_headers = block.getFieldValue('headers') == 'TRUE';
//   // TODO: Assemble JavaScript into code variable.
//   var code = '...;\n';
//   return [code, Blockly.JavaScript.ORDER_ATOMIC];
// };
Blockly.JavaScript['binary'] = function(block) {
  var variable_m1 = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('m1'), Blockly.Variables.NAME_TYPE);
  var dropdown_operation = block.getFieldValue('operation');
  var variable_m2 = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('m2'), Blockly.Variables.NAME_TYPE);
  var variable_result = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_child = Blockly.JavaScript.valueToCode(block, 'child', Blockly.JavaScript.ORDER_ATOMIC);
  var splitCode = dropdown_operation.split('||');
  Blockly.JavaScript.variables.push('private '+splitCode[1]+' m'+variable_result+';\n');
  var code = splitCode[0].replace(/\$1/g,'m'+variable_result)
  .replace(/\$2/g,variable_m1)
  .replace(/\$3/g,variable_m2)
  +'\n';
  return code;
};

Blockly.JavaScript['unary'] = function(block) {
  var dropdown_operation = block.getFieldValue('operation');
  var variable_m1 = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('m1'), Blockly.Variables.NAME_TYPE);
  var variable_result = Blockly.JavaScript.variableDB_.getName(block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value_child = Blockly.JavaScript.valueToCode(block, 'child', Blockly.JavaScript.ORDER_ATOMIC);
  var splitCode = dropdown_operation.split('||');
  Blockly.JavaScript.variables.push('private '+splitCode[1]+' m'+variable_result+';\n');

  var code = splitCode[0].replace(/\$1/g,'m'+variable_result)
  .replace(/\$2/g,variable_m1)
   +'\n';
  return code;
};


Blockly.JavaScript['tp_constant'] = function(block) {
  var text_constant = block.getFieldValue('constant');
  var save_var = block.getFieldValue('VAR');
  var code;
  Blockly.JavaScript.variables.push('private Marker m'+save_var+';\n');
  code = 'm'+save_var+' = mf.createImmutable("'+text_constant+'".getBytes(),0,"'+text_constant+'".getBytes().length);\n';
  Blockly.JavaScript.initFunctions.push(code);
  return '';
};

// Blockly.JavaScript['lists_create_with'] = function(block) {
//   var code='';
//   var parentVar;
//   if(block.getParent().type =='extractor'){
    
//     var newBlock = block.getParent();
//     // var value_line = Blockly.JavaScript.valueToCode(newBlock, 'line', Blockly.JavaScript.ORDER_ATOMIC);
//     // var value_file = Blockly.JavaScript.valueToCode(newBlock, 'file', Blockly.JavaScript.ORDER_ATOMIC);
//     // debugger;
//     parentVar ="line";  
//     // if(value_line!==''){
//     //   parentVar ="line";  
//     // }
//     // if(value_file!==''){
//     //   parentVar ="fileName";  
//     // }

//   }else if(block.getParent().type =='field_extractor'){
//     parentVar= 'm'+block.getParent().getFieldValue("VAR");
//   }else{
//     parentVar ="Store TODO";
//   }
//   for (var n = 0; n < block.itemCount_; n++) {
//     var str = Blockly.JavaScript.valueToCode(block, 'ADD'+n,0)|| undefined;
//     if(str){
//       str = str.replace("$$", parentVar);
//       code +=  str+"\n";
//     }
//   }
//   return [code, Blockly.JavaScript.ORDER_ATOMIC];
// };

Blockly.JavaScript['lookup'] = function(block) {
  var get_var = block.getFieldValue('var');
  var lookup_type = block.getFieldValue('operation');
  var data_source = block.getFieldValue('path');
  var keyName = block.getFieldValue('var_key');
  var valueName = block.getFieldValue('VAR');
  var code='';
  Blockly.JavaScript.variables.push('private Lookup m'+get_var+' = new '+lookup_type+'("'+data_source+'");\n');
  Blockly.JavaScript.variables.push('private Marker m'+valueName+';\n');
  Blockly.JavaScript.initFunctions.push('m'+get_var+'.bake();\n')
  code += 'm'+valueName+' = m'+get_var+'.get(m'+keyName+'.getData() == null ? data: m'+keyName+'.getData())';
  // code += 'm'+valueName+' = m'+get_var+'.get(m'+keyName+'.getBytes());\n';
  return code;
}

Blockly.JavaScript['store'] = function(block) {
  var get_Storage = block.getFieldValue('operation');
  var header_check = block.getFieldValue('headers');
  var getItemCount = block.itemCount_;
  var storeVars=[];
  var code ='';
  for(var i = 0; i<getItemCount; i++){
    var get_var = Blockly.JavaScript.valueToCode(block, 'ADD'+i, Blockly.JavaScript.ORDER_ATOMIC);
    if(get_var!=''){
      storeVars.push(get_var);
    }
  }
  
  storeVars.forEach(function(v) {
    code += ', m'+ v + '';
  });
  if(header_check==='TRUE'){
    Blockly.JavaScript.initFunctions.push('store.set("TestScript","'+storeVars.join('","')+'");\n');
  }
  Blockly.JavaScript.variables.push('private Store store = new '+get_Storage+'Store();\n');
  Blockly.JavaScript.storePhase = 'store.save(data, currentFileName '+code+');\n';
  return '';
}