Blockly.Blocks['field_extractor'] = {
  init: function() {
    this.appendValueInput("NAME")
        .setCheck("field_extractor")
        .appendField("get col#")
        .appendField(new Blockly.FieldTextInput("1"), "NAME")
        .appendField("as")
        .appendField(new Blockly.FieldDropdown(JSON.parse(Blockly.Tp.dataType)), "operation")
        .appendField("named as")
        .appendField(new Blockly.FieldVariable(Blockly.Tp.Counter.getNewVar(this.getFieldValue('operation'))), "VAR");
    this.setInputsInline(false);
    this.setOutput(true, "field_extractor");
    this.setColour(20);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks["delimiter"] = {
    init: function() {
        this.appendDummyInput()
            .appendField("delimiter")
            .appendField(new Blockly.FieldTextInput(""), "delim");
        this.setInputsInline(false);
        this.setOutput(true, "field_extractor");
        this.setColour(20);
        this.setTooltip("");
        this.setHelpUrl("http://www.example.com/");
        this.appendValueInput("next_marker").setCheck(["field_extractor"]);
        blockObj(this);
    },
    getEmptyConnectors: function() {
        var connections = this.getConnections_();
        var empty = false;
        connections.some(function(c) {
            debugger;
            if (c.type == 1 && !c.targetConnection) {
                empty = c;
                return true;
            }
        });
        return empty;
    },
    appendNewField: function() {
        var c = this.getEmptyConnectors();
        var field = renderBlock('field_extractor');
        if (!c) {
            c = this.appendValueInput("next_marker").setCheck(["field_extractor"]);
            c = c.connection;
        }
        c.connect(field.outputConnection);
        this.appendValueInput("next_marker").setCheck(["field_extractor"]);
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
