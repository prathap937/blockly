Blockly.Blocks.Manager = {
    datatype: '[["String", "string"], ["Date", "date"], ["Number", "number"]]',
    workspaceContainer: {},
    ws: {},
    changeListeners: [],
    allBlocks: {
        root: {
            children: []
        },
        delNode: function(id) {
            var node = this.root[id];
            this.root[id] = {};
            return node.children;
        },
        dettachChild: function(child, parent) {
            this.root[parent.id].children.splice(child.id, 1);
            this.root[child.id].parent = null;
        },
        addNode: function(obj, id, dataType, variableName, parent) {
            if (parent === undefined)
                this.root.children.push(id);
            else
                this.root[parent.id].children.push(id);
            this.root[id] = {
                'id': id,
                'obj': obj,
                'dataType': dataType,
                'variableName': variableName,
                'parent': parent,
                'children': []
            };
            return this.root[id];
        },
        getParent: function(child) {
            return this.allBlocks.root[child.id].parent;
        },
        ChangeDatatype: function(id, olddatatype, newdatatype) {
            if (oldtype === newtype) return;
            if (this.root[id].datatype === olddatatype) {
                this.root[id].datatype = newdatatype;
            }
            return this.root[id].children;
        },
        variableNameChange: function(id, oldName, newName) {
            if (oldName === newName) return;
            if (this.root[id].variableName === oldName) {
                this.root[id].variableName = newName;
            }
            return this.root[id].children;
        },
        getSupportedOperands: function(dataType) {
            var result = [];
            var key;
            if (!dataType) {
                for (key in this.root) {
                    try {
                        result.push(this.root[key].id);
                    } catch (e) {}
                }
            } else {
                for (key in this.root) {
                    try {
                        if (this.root[key].dataType === dataType) {
                            result.push(this.root[key].id);
                        }
                    } catch (e) {}
                }
            }
            return result;
        }
    },
    changeListener: function(event) {
        if (event.internal !== undefined) {
            //ignore
        }
        switch (event.type) {
            case Blockly.Events.CHANGE:
                switch (event.element) {
                    case 'comment':
                        break;
                    case 'collapsed':
                        break;
                    case 'disabled':
                        break;
                    case 'inline':
                        break;
                    case 'mutate':
                        break;
                }
                break;
            case Blockly.Events.CREATE:
                //debugger;
                var block = this.ws.getBlockById(event.blockId);
                this.allBlocks.addNode(block, event.blockId, block.type);
                if (block.type == 'delimiter') {
                    var fe = this.renderBlock('field_extractor');
                    this.allBlocks.addNode(fe, fe.blockId, fe.getFieldValue('operation'), fe.getFieldValue('VAR'), block);
                    this.attachBlock(fe, block);
                }
                break;
            case Blockly.Events.DELETE:
            //debugger;
                this.allBlocks.delNode(block.blockId);
                //TODO del all children recursively
                break;
            case Blockly.Events.MOVE:
                block = this.ws.getBlockById(event.blockId);
                if (event.newParentId) {//attached
                    var blockP = this.ws.getBlockById(event.newParentId);
                    if (blockP.type == 'delimiter') {
                        blockP.appendEmptyInput();
                    }
                    this.allBlocks.addNode(block, event.blockId, block.type, blockP);
                    //TODO create new block  & add it to either transform block or store
                } else {
                    var c = this.allBlocks.getParent(block);
                    if (c) {
                        // if (c.type == 'delimiter') {

                        // }
                        // var operation = block.getFieldValue('operation');
                        // this.allBlocks.dettachChild(block, this.allBlocks.root[]);
                        // this.allBlocks.addNode(block, block.id, operation, block.getFieldValue('VAR'), null);
                    }
                }
                break;
            case Blockly.Events.UI:
                break;
        }
    },
    registerChangeEvent: function(block, type) {

    },
    unRegisterChangeEvent: function(block, type) {

    },
    attachBlock: function(child, parent) {
        this._executeEvent({
            type: "move",
            blockId: child.id,
            newParentId: parent.id,
            internal: true,
            toJson: function() {
                return {
                    type: "move",
                    blockId: child.id,
                    newParentId: parent.id
                };
            }
        });
    },
    deattachBlock: function(child, parent) {
        this._executeEvent({
            type: "move",
            blockId: child.id,
            newParentId: parent.id,
            internal: true,
            toJson: function() {
                return {
                    type: "move",
                    blockId: child.id,
             //       newParentId: parent.id
                };
            }
        });
    },
    getSupportedOperands: function(block) {
        return this.allBlocks.getSupportedOperands((block === undefined)? null : block.getDataType);
    },
    getSupportedOperators: function(block) {
        return block.getSupportedOperators();
    },
    getSupportedDataTypes: function(block) {
        return this.dataType;
    },
    renderBlock: function (id) {
        var mainWorkspace = Blockly.getMainWorkspace();
        var newBlock = mainWorkspace.newBlock(id);
        newBlock.initSvg();
        mainWorkspace.render();
        // meathod to call after block is rendered
        // more lke an initcalback
        if (newBlock.afterInit) {
            newBlock.afterInit();
        }
        return newBlock;
    },
    _dataTypeChanged: function(block, olddatatype, newdatatype){
        this.allBlocks.ChangeDatatype(block.id, olddatatype, newdatatype);
    },
    _executeEvent: function(event) {
        Blockly.Events.fromJson(event.toJson(), bbm.ws)
            .run(true);
    }
};
var bbm = Blockly.Blocks.Manager;
Blockly.Blocks.Manager.ws = Blockly.getMainWorkspace();
//Blockly.Blocks.Manager.workspaceContainer = Blockly.inject('workspaceDiv', {});
Blockly.getMainWorkspace().addChangeListener(Blockly.Blocks.Manager.changeListener.bind(bbm));