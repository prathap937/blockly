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
  },
  onchange: function(e) {
    var self = this;
    if (!this.workspace || e.blockId != this.id) {
      return;
    }
    // if (e.type == 'move') {
    //   var opConn = this.outputConnection;
    //   if (opConn && opConn.targetConnection && opConn.targetConnection.sourceBlock_.type == 'delimiter') {
    //     opConn.targetConnection.sourceBlock_.appendEmptyInput();
    //   }
    // }
  },
  renameVar: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getFieldValue('VAR'))) {
      this.setFieldValue(newName, 'VAR');
    }
  },
  getVars: function() {
    return [this.getFieldValue('VAR')];
  }
};

// Blockly.Blocks["delimiter"] = {
//   init: function() {
//     this.appendDummyInput()
//       .appendField("delimiter")
//       .appendField(new Blockly.FieldTextInput(""), "delim");
//     this.setInputsInline(false);
//     this.setOutput(true, "field_extractor");
//     this.setColour(20);
//     this.setTooltip("");
//     this.setHelpUrl("http://www.example.com/");
//     this.appendValueInput(this.getVarName()).setCheck(["field_extractor"]);
//   },
//   getVarName: function() {
//     this.count += 1;
//     return 'next_marker_' + Blockly.Tp.Counter.getNewVar();
//   },
//   onchange: function(e) {
//     var self = this;
//     if (!this.workspace || e.blockId != this.id) {
//       return;
//     }
//     this.validate();
//     var _delim = this.getFieldValue('delim');
//     // if (e.type == 'change') {
//     //   if (e.name == 'delim' && _delim != '' && e.oldValue == '') {
//     //     // if (this.getInput('next_marker')) {
//     //     //   return false;
//     //     // }
//     //     this.appendNewField();
//     //   }
//     // }
//     if (e.type == 'move') {
//       var opConn = this.outputConnection;
//       if (opConn && opConn.targetConnection && opConn.targetConnection.sourceBlock_.type == 'delimiter') {
//         opConn.targetConnection.sourceBlock_.createEmptyInput();
//       }
//     }
//   },
//   getEmptyConnectors: function() {
//     var connections = this.getConnections_();
//     var empty = false;
//     connections.some(function(c) {
//       if (c.type == 1 && !c.targetConnection) {
//         empty = c;
//         return true;
//       }
//     });
//     return empty;
//   },
//   appendNewField: function() {
//     var conn = this.createEmptyInput();
//     var field = renderBlock('field_extractor');
//     conn.connect(field.outputConnection);
//   },
//   validate: function() {
//     var _delim = this.getFieldValue('delim');
//     if (_delim == '') {
//       this.setWarningText('Fill in delimiter');
//     } else {
//       this.setWarningText(null);
//     }
//   },

//   createEmptyInput: function() {
//     var c = this.getEmptyConnectors();
//     if (!c) {
//       c = this.appendValueInput(this.getVarName()).setCheck(["field_extractor"]);
//       c = c.connection;
//     }
//     return c;
//   },

//   afterInit: function() {
//     this.appendNewField();
//   }
// }
Blockly.Blocks["delimiter"] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.itemCount_ = 1;
    this.appendDummyInput()
      .appendField("delimiter")
      .appendField(new Blockly.FieldTextInput(""), "delim");
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendValueInput('next_marker_' + this.itemCount_);
    this.setOutput(true, 'Array');
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

  appendEmptyInput: function() {
    // loop through all lines
    for (var i = 0; i < (this.itemCount_ + 1); i++) {
      var input = this.getInput('next_marker_' + i);
      // if there is a free input with this name
      // break from loop
      if (input && !input.connection.targetBlock()) {
        return false;
      }
    }
    // If there are no empty inputs, create one
    this.appendValueInput('next_marker_' + this.itemCount_);
    this.itemCount_ += 1;
    this.mutationToDom();
  },

  updateShape_: function() {
    // Delete everything.
    if (this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else {
      var i = 0;
      while (this.getInput('next_marker_' + i)) {
        this.removeInput('next_marker_' + i);
        i++;
      }
    }
    // Rebuild block.
    if (this.itemCount_ == 0) {
      this.appendValueInput('next_marker_' + i);
    } else {
      for (var i = 0; i < this.itemCount_; i++) {
        var input = this.appendValueInput('next_marker_' + i);
      }
    }
  },

  // call abck after init
  afterInit: function() {
    // if no free inputs, create one
    // this.appendEmptyInput();
    // renderBlock('field_extractor');
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
