Blockly.Tp = {};
Blockly.Tp.dataType = '[["String", "string"], ["Date", "date"], ["Number", "number"]]';
Blockly.Tp.variableDateTypeMap = {i:'string'};
Blockly.Tp.variableMap = {};

// Connects blocks to transform
Blockly.Tp._connectMeToTransform = function(block) {
    var transformInputLists = Blockly.Tp.transform_.inputList;
    block.previousConnection.connect(transformInputLists[transformInputLists.length - 1].connection);
}

var blockObj = function(obj) {
    obj.renameVar = function(oldName, newName) {
        if (Blockly.Names.equals(oldName, obj.getFieldValue('VAR'))) {
            obj.setFieldValue(newName, 'VAR');
        }
    }
    obj.getVars = function() {
        return [obj.getFieldValue('VAR')];
    }

};


Blockly.Blocks["extractor"] = {
    init: function() {
        this.appendValueInput("line")
            .setCheck(['field_extractor', 'Array'])
            .appendField("Extract from line");
        this.appendValueInput("file")
            .setCheck(["field_extractor","Array"])
            .appendField("Extract from file name");
        this.setInputsInline(false);
        this.setNextStatement("transform");
        this.setColour(20);
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        Blockly.Tp.extractor_ = this;
    },
    validate: function() {
        var lines = this.getInputTargetBlock('line');
        var files = this.getInputTargetBlock('file');
        if (!lines && !files) {
            this.setWarningText('Append atleast one extraction or transformation');
            return false;
        }
        this.setWarningText(null);
        return true;
    },
    onchange: function(e) {
        this.validate();
    }
};

Blockly.Blocks["field_extractor"] = {
    currrentParent:null,
    counter:0,
    init: function() {
        this.appendDummyInput()
            .appendField("extract col # ")
            // .appendField(new Blockly.FieldNumber(''), "get")
            // .appendField(new Blockly.FieldVariable(''), "get")
            .appendField(new Blockly.FieldTextInput(''), "get")
            .appendField("is of type")
            .appendField(new Blockly.FieldDropdown(JSON.parse(Blockly.Tp.dataType)), "operation")
            .appendField(" & is named")
            .appendField(new Blockly.FieldVariable(""), "VAR");
        this.appendValueInput("next_marker")
            .setCheck(["field_extractor","Array"]);
        this.setInputsInline(false);
        this.setOutput(true, "field_extractor");
        this.setColour(20);
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        blockObj(this);
        window.q = this;
    },
    onchange: function(e) {

        if (!this.workspace || e.blockId != this.id) {
            return;
        }

        if (e.type == 'change') {
            var varType = this.getFieldValue('operation');
            var variable = this.getFieldValue('VAR');
            if (e.name == 'VAR') {
                var mainWorkspace = Blockly.getMainWorkspace();
                if (variable.charAt(0) == '_') {
                    // Appends new block to main workspace
                    var newBlock = mainWorkspace.newBlock('binary');
                    newBlock.initSvg();
                    newBlock.render();
                    var inputLists = Blockly.Tp.transform_.inputList;
                    // Sets default value
                    newBlock.setFieldValue(variable, 'm1');
                    // Connects to Blockly.Tp.transform_
                    // @Read more: Blockly.Connection.prototype.connect
                    var c1 = new Blockly.Connection(newBlock, Blockly.PREVIOUS_STATEMENT);
                    newBlock.previousConnection.connect(inputLists[inputLists.length - 1].connection);
                } else {
                    var newVar = mainWorkspace.newBlock('output_field');
                    newVar.initSvg();
                    newVar.render();
                    newVar.setFieldValue(variable, 'NAME');
                    Blockly.Tp.store_.appendNewVar(newVar.outputConnection);
                }
                if (Blockly.Tp.variableDateTypeMap[variable]) {
                    this.setWarningText('Use unique variable names');
                    return false;
                }
                Blockly.Tp.variableDateTypeMap[e.newValue] = varType;
                if (e.oldValue) {
                    delete Blockly.Tp.variableDateTypeMap[e.oldValue];
                }
            } else if (e.name == 'operation') {
                Blockly.Tp.variableDateTypeMap[variable] = e.newValue;
            }
            if (e.newValue == 'date') {
                var _newDateBlock = renderBlock('tp_date_format');
                _newDateBlock.setFieldValue(this.getFieldValue('VAR'), 'prefix');
            }
        }else if (e.type == 'move') {
            if(e.newParentId!==undefined){
                var parentElement = workspace.getBlockById(e.newParentId);

                if(parentElement.type === 'delimiter'){
                    parentElement.appendNewField();
                    this.currrentParent=e.newParentId;
                    // if(parentElement.getDescendants().length == parentElement.getConnections_().length){

                    // }
                }
            }else{
                if(this.currrentParent){
                    var parentElement = workspace.getBlockById(this.currrentParent);
                    if (parentElement.deleteEmptytInput) {
                        setTimeout(function(){
                            parentElement.deleteEmptytInput();
                        },100);
                        this.currrentParent = null;
                    }
                 // if(parentElement.getDescendants().length+1 < parentElement.getConnections_().length){
                 //     parentElement.getConnections_().some(function(item,index){
                 //        if(!item.targetConnection){
                 //           parentElement.removeInput("next_marker"+index);
                 //           this.currrentParent = null;
                 //        }
                 //    })
                     
                 // }    
                }
                
              //  debugger;    
            }

            
        }

        // Blockly.Tp.variableMap[this.getFieldValue("VAR")] = this.getFieldValue("operation");
        this.getFieldValue('VAR');
        this.getFieldValue('operation');
        this.validate();
    },

    validate: function() {
        var _isError = [];
        var number_get = this.getFieldValue('get');
        var text_delim = this.getFieldValue('delim');
        var variable_marker = this.getFieldValue('VAR');
        if (number_get == '') {
            _isError.push('Give a token ordinal');
        } else {
            number_get = +number_get;
            if (!Number.isInteger(number_get)) {
                _isError.push('Token ordinal should be a number');
            }
        }
        if (text_delim == '') {
            _isError.push('Text delimiter missing');
        }
        if (variable_marker.charAt(0) == 'f') {
            _isError.push('Variable names cannot be "f"');
        }
        if (_isError.length) {
            this.setWarningText(_isError.join('\n'));
            return false;
        } else {
            this.setWarningText(null);
            return true;
        }
    }

};

Blockly.Blocks["transform"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Translate");
        this.appendStatementInput("NAME")
            .setCheck(null);
        this.setInputsInline(false);
        this.setPreviousStatement(true, "extractor");
        this.setNextStatement(true, "store");
        this.setColour(180);
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        Blockly.Tp.transform_ = this;
    }
};

Blockly.Blocks["store"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Pick storage")
            .appendField(new Blockly.FieldDropdown([
                ["Hdfs", "Hdfs"],
                ["Local", "Local"]
            ]), "operation")
            .appendField("location")
        //     .appendField(new Blockly.FieldTextInput(""), "path");
        // this.appendDummyInput()
            .appendField("Use variable names as header")
            .appendField(new Blockly.FieldCheckbox("TRUE"), "headers");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setColour(345);
        this.setTooltip("");
        this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
        this.setHelpUrl("http://www.example.com/");
        Blockly.Tp.store_ = this;
        this.itemCount_ = 2;
        this.updateShape_();
    },
    validate: function() {
        var location = this.getFieldValue('path');
        if (location == '') {
            this.setWarningText('Select a location');
            return false;
        }
        this.setWarningText(null);
        return true;
    },
    onchange: function() {
        this.validate();
    },
    decompose: function(workspace) {
        var containerBlock = workspace.newBlock('lists_create_with_container');
        containerBlock.initSvg();
        var connection = containerBlock.getInput('STACK').connection;
        for (var i = 0; i < this.itemCount_; i++) {
            var itemBlock = workspace.newBlock('lists_create_with_item');
            itemBlock.initSvg();
            connection.connect(itemBlock.previousConnection);
            connection = itemBlock.nextConnection;
        }
        return containerBlock;
    },
    mutationToDom: function() {
        var container = document.createElement('mutation');
        container.setAttribute('items', this.itemCount_);
        return container;
    },
    domToMutation: function(xmlElement) {
        this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
        this.updateShape_();
    },
    compose: function(containerBlock) {
        var itemBlock = containerBlock.getInputTargetBlock('STACK');
        // Count number of inputs.
        var connections = [];
        while (itemBlock) {
            connections.push(itemBlock.valueConnection_);
            itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
        }
        this.itemCount_ = connections.length;
        this.updateShape_();
        // Reconnect any child blocks.
        for (var i = 0; i < this.itemCount_; i++) {
            if (connections[i]) {
                this.getInput('ADD' + i).connection.connect(connections[i]);
            }
        }
    },
    updateShape_: function() {
        // Delete everything.
        if (this.getInput('EMPTY')) {
            this.removeInput('EMPTY');
        } else {
            var i = 0;
            while (this.getInput('ADD' + i)) {
                this.removeInput('ADD' + i);
                i++;
            }
        }
        // Rebuild block.
        if (this.itemCount_ == 0) {
            this.appendDummyInput('EMPTY')
                .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
        } else {
            for (var i = 0; i < this.itemCount_; i++) {
                var input = this.appendValueInput('ADD' + i);
                if (i == 0) {
                    input.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
                }
            }
        }
    },
    appendNewVar: function(connection) {
        this.itemCount_++;
        this.updateShape_();
        this.getInput('ADD' + (this.itemCount_ - 1)).connection.connect(connection);
    }
};

Blockly.Blocks["unary"] = {
    OPERATIONS: {
        tpDate: {
            unary: [
                ["convertDate", "$1 = tpDate.convertDate(m$2.getData() == null ? data: m$2.getData(), m$2, MarkerFactory, m$3);||Marker"],
            ]
        },
        tpString: {
            unary: [
                ["toLowerCase", "$1 = tpString.toLowerCase(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["toTitleCase", "$1 = tpString.toTitleCase(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["toUpperCase", "$1 = tpString.toUpperCase(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["isNull", "$1 = tpString.isNull(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||boolean"],
                ["length", "$1 = tpString.length(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["rTrim", "$1 = tpString.rTrim(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["lTrim", "$1 = tpString.lTrim(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["trim", "$1 = tpString.trim(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"]
            ]
        },
        tpMath: {
            unary: [
                ["abs", "$1 =tpMath.abs(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["ceil", "$1 =tpMath.ceil(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["round", "$1 =tpMath.round(m$2.getData() == null ? data: m$2.getData(), integer, m$2, mf);||Marker"],
                ["floor", "$1 =tpMath.floor(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["isNumber", "$1 =tpMath.isNumber(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||boolean"],
                ["extractDecimalFractionPart", "$1 =tpMath.extractDecimalFractionPart(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["extractDecimalIntegerPart", "$1 =tpMath.extractDecimalIntegerPart(m$2.getData() == null ? data: m$2.getData(), m$2, mf);||Marker"],
                ["toMarker", "$1 =tpMath.toMarker(m$2 , mf);||Marker"],
                ["toMarker", "$1 =tpMath.toMarker(m$2, mf);||Marker"]
            ]
        },
        tpLogic: {
            unary: [
                ["not", "$1 = tpLogic.not(m$2)||boolean"]
            ]
        }
    },
    init: function() {
        this.appendDummyInput()
            .appendField(new Blockly.FieldVariable(""), "m1")
            .appendField(new Blockly.FieldDropdown([
                []
            ]), "operation")
            .appendField(" & is named as")
            .appendField(new Blockly.FieldVariable(""), "VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#006400");
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        Blockly.Tp._connectMeToTransform(this);
    },
    getDropDown: function() {
        var superSet = JSON.parse(Blockly.Tp.dataType);
        var m1 = this.getFieldValue("m1");
        var dataType = Blockly.Tp.variableDateTypeMap[m1];
        switch (dataType) {
            case 'string':
                return this.OPERATIONS.tpString.unary;
                break;
            case 'number':
                return this.OPERATIONS.tpMath.unary;
                break;
            case 'date':
                return this.OPERATIONS.tpDate.unary;
                break;
            default:
                return this.OPERATIONS.tpLogic.unary;

        }
    },
    onchange: function(changeEvent) {
        if (changeEvent.blockId != this.id) {
            return;
        }
        if (changeEvent.type === "change" && changeEvent.name == 'm1') {
            var m1 = this.getFieldValue("m1");
            var options = this.getDropDown(m1); // The new options you want to have
            var drop = this.getField("operation");
            drop.setText(" "); // set the actual text
            drop.setValue(" "); // set the actual value
            drop.menuGenerator_ = options;
        }
        this.validate();
    },
    validate: function() {
        var m1 = this.getFieldValue('m1');
        var operation = this.getFieldValue('operation');
        var result = this.getFieldValue('VAR');
        if (m1 == '' || operation == '' || result == '' || operation == ' ') {
            this.setWarningText('Fill all fields');
            return false;
        }
        this.setWarningText(null);
        return true;
    }

};

Blockly.Blocks['lookup'] = {
    init: function() {
            var dummyInput = new Blockly.FieldTextInput(Date.now());
            dummyInput.setVisible(false);
        this.appendDummyInput()
            .appendField(dummyInput,"var")
            .appendField("Lookup type")
            .appendField(new Blockly.FieldDropdown([
                ["Search", "Search"],
                ["PrefixLookupIgnoreCase", "PrefixLookupIgnoreCase"],
                ["PrefixLookup", "PrefixLookup"],
                ["MatchKey", "MatchKey"]
            ]), "operation")
            .appendField("specify data source")
            .appendField(new Blockly.FieldTextInput("default"), "path");
        this.appendDummyInput()
            .appendField("Pick key")
            .appendField(new Blockly.FieldVariable("item"), "var_key")
            .appendField("   value called as")
            .appendField(new Blockly.FieldVariable(""), "VAR")
            .appendField(" and is of type")
            .appendField(new Blockly.FieldDropdown(JSON.parse(Blockly.Tp.dataType)), "type");

        //.appendField(new Blockly.FieldDropdown(Blockly.Blocks.dataType), "data_type");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour(345);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
        blockObj(this);
    },
    onchange: function(e) {
        if (!this.workspace || e.blockId != this.id) {
            return;
        }
        if(e.type=='create'){
            var drop = this.getField("VAR");
            var options = [];
            drop.setText(" "); // set the actual text
            drop.setValue(" "); // set the actual value
            options.push(Blockly.Msg.NEW_VARIABLE);
            drop.menuGenerator_ = [options];
        }
        this.validate();
    },
    validate: function() {
        var m1 = this.getFieldValue('m1');
        var operation = this.getFieldValue('operation');
        var path = this.getFieldValue('path');
        var var_key = this.getFieldValue('var_key');
        var var_value = this.getFieldValue('VAR');
        var type = this.getFieldValue('type');
    }
};

Blockly.Blocks['output_field'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable(""), "NAME");
    this.setOutput(true, null);
    this.setColour(330);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['tp_constant'] = {
    init: function() {
        this.appendDummyInput()
            .appendField("Define ")
            .appendField(new Blockly.FieldTextInput("default"), "value")
            .appendField("as")
            .appendField(new Blockly.FieldDropdown([
                ["String", "string"],
                ["Number", "number"],
                ["Date", "date"]
            ]), "NAME")
            .appendField("save as")
            .appendField(new Blockly.FieldTextInput("default"), "VAR");
        this.setPreviousStatement(true);
        this.setNextStatement(true);
        this.setColour(230);
        this.setTooltip('');
        this.setHelpUrl('http://www.example.com/');
        blockObj(this);
        // connects automatically to translate
        Blockly.Tp._connectMeToTransform(this);
    },
    onchange: function(changeEvent) {
        if (!this.workspace || changeEvent.blockId != this.id) {
            return;
        }
        var _var = this.getFieldValue('VAR');
        var _type = this.getFieldValue('NAME');
        // Change type is change
        if (changeEvent.type == 'change') {
            // If rename => delete previous entry
            if (changeEvent.name == 'VAR') {
                // Duplicate entry
                if (Blockly.Tp.variableDateTypeMap[_var]) {
                    this.setWarningText('Duplicate variable name');
                    return false;
                } else {
                    // delte old entry
                    delete Blockly.Tp.variableDateTypeMap[changeEvent.oldValue];
                }
            }
            // set new values
            Blockly.Tp.variableDateTypeMap[_var] = _type;
            this.setWarningText(null);
        }
    }
};

Blockly.Blocks["binary"] = {
    OPERATIONS: {
        tpDate: {
            binary: [
                ["after", "$1 = tpDate.after(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3);||boolean"],
                ["before", "$1 = tpDate.before(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3);||boolean"],
                ["differenceInMillis", "$1 = tpDate.differenceInMillis(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3);||Marker"]
            ]
        },
        tpString: {
            binary: [
                ["contains", "$1 = tpString.contains(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["containsIgnoreCase", "$1 = tpString.containsIgnoreCase(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["endsWith", "$1 = tpString.endsWith(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["endsWithIgnore", "$1 = tpString.endsWithIgnore(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["extractLeading", "$1 = tpString.extractLeading(m$2.getData() == null ? data: m$2.getData(), $1, integer, mf);||Marker"],
                ["extractTrailing", "$1 = tpString.extractTrailing(m$2.getData() == null ? data: m$2.getData(), $1, integer, mf);||Marker"],
                ["indexOf", "$1 = tpString.indexOf(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["indexOIgnoreCase", "$1 = tpString.indexOIgnoreCase(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["merge", "$1 = tpString.merge(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["startsWith", "$1 = tpString.startsWith(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3);||boolean"]
            ]
        },
        tpMath: {
            binary: [
                ["addDouble", "$1 = tpMath.addDouble(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["addLong", "$1 = tpMath.addLong(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["eq", "$1 = tpMath.eq(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["greaterEqThan", "$1 = tpMath.greaterEqThan(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["greaterThan", "$1 = tpMath.greaterThan(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["lessEqThan", "$1 = tpMath.lessEqThan(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["lessThan", "$1 = tpMath.lessThan(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||boolean"],
                ["max", "$1 = tpMath.max(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["min", "$1 = tpMath.min(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["subDouble", "$1 = tpMath.subDouble(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"],
                ["subLong", "$1 = tpMath.subLong(m$2.getData() == null ? data: m$2.getData(), m$2, m$3.getData() == null ? data: m$3.getData(), m$3, mf);||Marker"]
            ]
        },
        tpLogic: {
            binary: [
                ["and", "$1 = tpLogic.and(m$2, m$3);||Marker"],
                ["or", "$1 = tpLogic.or(m$2, m$3);||Marker"]
            ]
        }
    },
    init: function() {
        this.appendDummyInput('binaryOp')
            .appendField(new Blockly.FieldVariable(""), "m1")
            .appendField(new Blockly.FieldDropdown([
                []
            ]), "operation")
            .appendField(new Blockly.FieldVariable(""), "m2")
            .appendField(" & is named as")
            .appendField(new Blockly.FieldVariable(""), "VAR");
        this.setInputsInline(false);
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#006400");
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        blockObj(this);
        Blockly.Tp._connectMeToTransform(this);
    },

    getDropDown: function(m1) {
        var superSet = JSON.parse(Blockly.Tp.dataType);
        var dataType = Blockly.Tp.variableDateTypeMap[m1];
        switch (dataType) {
            case 'string':
                return this.OPERATIONS.tpString.binary;
                break;
            case 'number':
                return this.OPERATIONS.tpMath.binary;
                break;
            case 'date':
                return this.OPERATIONS.tpDate.binary;
                break;
            default:
                return this.OPERATIONS.tpLogic.binary;

        }
    },


    onchange: function(changeEvent) {
        if (!this.workspace || changeEvent.blockId != this.id) {
            return;
        }
        if (changeEvent.type === "change" && changeEvent.name == 'm1') {
            var m1 = this.getFieldValue("m1");
            var dataType = Blockly.Tp.variableMap[m1];
            var op = this.getFieldValue("operation");
            var options = this.getDropDown(m1); // The new options you want to have
            var drop = this.getField("operation");
            drop.setText(" "); // set the actual text
            drop.setValue(" "); // set the actual value
            drop.menuGenerator_ = options;
        }
        this.validate();
        /* if(changeEvent.type === "ui")
        if (!this.workspace) {
            return;
        }
        var m1Field = this.getFieldValue("m1");
        var binaryOp = Blockly.Tp.variableMap[m1Field] === 'string';
        if (binaryOp) {
            this.updateShape_binary(binaryOp,m1Field);
        }
    },
    updateShape_binary: function(binaryOp,m1Field) {
    var inputExists = this.getInput('binaryOp');
    if (binaryOp) {
      if (!inputExists) {
        this.appendDummyInput('binaryOp')
            .appendField(new Blockly.FieldVariable(""), "m1")
            .appendField(new Blockly.FieldDropdown(getDropDown(m1Field)), "operation")
            .appendField(" & is named as")
            .appendField(new Blockly.FieldVariable(""), "result");
        this.setInputsInline(false);
        
      }
    } else if (inputExists) {
      this.removeInput('binaryOp');
    }*/
    },
    validate: function() {
        var m1 = this.getFieldValue('m1');
        var m2 = this.getFieldValue('m2');
        var operation = this.getFieldValue('operation');
        var result = this.getFieldValue('VAR');
        if (m1 == '' || operation == ' ' || result == '' || m2 == '' || operation == '') {
            this.setWarningText('Fill all fields');
            return false;
        }
        this.setWarningText(null);
        return true;
    }

};

Blockly.Blocks['tp_date_format'] = {
   init: function() {
       this.appendDummyInput()
           .appendField('Date, ')
           .appendField('', 'prefix')
           .appendField('is formatted as')
           .appendField(new Blockly.FieldTextInput('dd-mm-yyyy'), 'dateFormat');
       this.setPreviousStatement(true);
       this.setNextStatement(true);
       this.setColour(230);
       this.setTooltip('');
       this.setHelpUrl('http://www.example.com/');
       blockObj(this);
       // connects automatically to translate
       // Blockly.Tp._connectMeToTransform(this);
   }
}


Blockly.FieldVariable.dropdownCreate = function() {
    if (this.sourceBlock_ && this.sourceBlock_.workspace) {
        var variableList =
            Blockly.Variables.allVariables(this.sourceBlock_.workspace);
    } else {
        var variableList = [];
    }
    // Ensure that the currently selected variable is an option.
    var name = this.getText();
    if (name && variableList.indexOf(name) == -1) {
        variableList.push(name);
    }
    variableList.sort(goog.string.caseInsensitiveCompare);
    variableList.push(Blockly.Msg.RENAME_VARIABLE);
    variableList.push(Blockly.Msg.NEW_VARIABLE);
    if (this.name && this.name != 'VAR') {
        variableList.splice(-2, 2);
    }
    // Variables are not language-specific, use the name as both the user-facing
    // text and the internal representation.
    var options = [];
    for (var x = 0; x < variableList.length; x++) {
        options[x] = [variableList[x], variableList[x]];
    }
    return options;
};

function renderBlock(id) {
    var mainWorkspace = Blockly.getMainWorkspace();
    var newBlock = mainWorkspace.newBlock(id);
    newBlock.initSvg();
    mainWorkspace.render();
    return newBlock;
}

// Overrides currrent context menu
Blockly.WorkspaceSvg.prototype.showContextMenu_ = function(e) {
    if (this.options.readOnly || this.isFlyout) {
        return;
    }
    var menuOptions = [];
    var topBlocks = this.getTopBlocks(true);
    // Option to clean up blocks.
    var cleanOption = {};
    cleanOption.text = Blockly.Msg.CLEAN_UP;
    cleanOption.enabled = topBlocks.length > 1;
    cleanOption.callback = this.cleanUp_.bind(this);
    menuOptions.push(cleanOption);

    // Add a little animation to collapsing and expanding.
    var DELAY = 10;
    if (this.options.collapse) {
        var hasCollapsedBlocks = false;
        var hasExpandedBlocks = false;
        for (var i = 0; i < topBlocks.length; i++) {
            var block = topBlocks[i];
            while (block) {
                if (block.isCollapsed()) {
                    hasCollapsedBlocks = true;
                } else {
                    hasExpandedBlocks = true;
                }
                block = block.getNextBlock();
            }
        }

        /*
         * Option to collapse or expand top blocks
         * @param {boolean} shouldCollapse Whether a block should collapse.
         * @private
         */
        var toggleOption = function(shouldCollapse) {
            var ms = 0;
            for (var i = 0; i < topBlocks.length; i++) {
                var block = topBlocks[i];
                while (block) {
                    setTimeout(block.setCollapsed.bind(block, shouldCollapse), ms);
                    block = block.getNextBlock();
                    ms += DELAY;
                }
            }
        };

        // Option to collapse top blocks.
        var collapseOption = {
            enabled: hasExpandedBlocks
        };
        collapseOption.text = Blockly.Msg.COLLAPSE_ALL;
        collapseOption.callback = function() {
            toggleOption(true);
        };
        menuOptions.push(collapseOption);

        // Option to expand top blocks.
        var expandOption = {
            enabled: hasCollapsedBlocks
        };
        expandOption.text = Blockly.Msg.EXPAND_ALL;
        expandOption.callback = function() {
            toggleOption(false);
        };
        menuOptions.push(expandOption);
    }

    // Option to delete all blocks.
    // Count the number of blocks that are deletable.
    var deleteList = [];

    function addDeletableBlocks(block) {
        if (block.isDeletable()) {
            deleteList = deleteList.concat(block.getDescendants());
        } else {
            var children = block.getChildren();
            for (var i = 0; i < children.length; i++) {
                addDeletableBlocks(children[i]);
            }
        }
    }
    for (var i = 0; i < topBlocks.length; i++) {
        addDeletableBlocks(topBlocks[i]);
    }
    var deleteOption = {
        text: deleteList.length <= 1 ? Blockly.Msg.DELETE_BLOCK : Blockly.Msg.DELETE_X_BLOCKS.replace('%1', String(deleteList.length)),
        enabled: deleteList.length > 0,
        callback: function() {
            if (deleteList.length < 2 ||
                window.confirm(Blockly.Msg.DELETE_ALL_BLOCKS.replace('%1',
                    String(deleteList.length)))) {
                deleteNext();
            }
        }
    };


    function deleteNext() {
        var block = deleteList.shift();
        if (block) {
            if (block.workspace) {
                block.dispose(false, true);
                setTimeout(deleteNext, DELAY);
            } else {
                deleteNext();
            }
        }
    }

    function addWorkspaceOptions() {
        var obj = [{
            enabled: true,
            text: "Field Extractor",
            // callback: CreateFieldExtractor
            callback: function() {
                renderBlock('field_extractor');
            }
        }, {
            enabled: true,
            text: "Binary Operator",
            // callback: CreateBinaryOperator
            callback: function() {
                renderBlock('binary');
            }
        }, {
            enabled: true,
            text: "Unary Operator",
            // callback: CreateUnaryOperator
            callback: function() {
                renderBlock('unary');
            }
        }, {
            enabled: true,
            text: "Lookup",
            // callback: CreateLookupOperator
            callback: function() {
                renderBlock('lookup');
            }
        }, {
            enabled: true,
            text: "Add Constants",
            // callback: CreateConstants
            callback: function() {
                renderBlock('tp_constant');
            }
        }, {
            enabled: true,
            text: "Logic Control-if",
            // callback: CreateLogic
            callback: function() {
                renderBlock('controls_if');
            }
        }, {
            enabled: true,
            text: "Delimiter",
            // callback: CreateLogic
            callback: function() {
                renderBlock('delimiter');
            }
        }, {
            enabled: true,
            text: "Variable",
            // callback: CreateLogic
            callback: function() {
                renderBlock('output_field');
            }
        }];
        obj.forEach(function(item) {
            menuOptions.push(item);
        });
    }
    addWorkspaceOptions();
    menuOptions.push(deleteOption);


    Blockly.ContextMenu.show(e, menuOptions, this.RTL);
};

Blockly.Blocks["delimiter"] = {
    counter: 0,
    init: function() {

        this.appendDummyInput("")
            .appendField('Delimiter')
            .appendField(new Blockly.FieldTextInput(""), "delim");
        this.setInputsInline(false);
        this.setOutput(true, ["field_extractor", "Array"]);
        this.setColour(20);
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        this.appendNewField();
    },
    deleteEmptytInput: function() {

        var emptyConnections = [];
        var inputList = this.inputList;
        var removeItem = [];
        for (var i = 0; i < (inputList.length-1); i++) {
            if(inputList[i].connection && !inputList[i].connection.targetConnection){
                this.removeInput(inputList[i].name);
            }
        }
        
    },
    getEmptyConnectors: function() {
        var connections = this.getConnections_();
        var empty = false;
        connections.some(function(c) {
            // debugger;
            if (c.type == 1 && !c.targetConnection) {
                empty = c;
                return true;
            }
        });
        return empty;
    },
    appendNewField: function() {
        var c = this.getEmptyConnectors();
        if (!c) {
            c = this.appendValueInput("next_marker" + this.counter).setCheck(["field_extractor"]);
            this.counter += 1;
            c = c.connection;
        }
    },
    onchange: function(e) {
        var self = this;
        if (!this.workspace || e.blockId != this.id) {
            return;
        }
        var _delim = this.getFieldValue('delim');
        if (e.type == 'change') {
            if (e.name == 'delim' && _delim != '' && e.oldValue == '') {
                if (this.getInput('next_marker')) {
                    return false;
                }
                this.appendNewField();
            }
        }
        this.validate();
    },

    validate: function() {

    }
}

Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH = 'Splitter';
