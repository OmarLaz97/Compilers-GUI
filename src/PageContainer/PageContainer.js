import React from "react";
import {
  Editor,
  CompositeDecorator,
  EditorState,
  convertToRaw,
  RichUtils,
  Modifier,
  ContentState,
  SelectionState
} from "draft-js";

import * as Regex from "../lex/lex";
import Line from "./line";
import { Grid, Image, Label, Segment } from "semantic-ui-react";
import { getDefaultKeyBinding, KeyBindingUtil } from "draft-js";
import { Menu } from "semantic-ui-react";

import "./PageContainer.css";

const { hasCommandModifier } = KeyBindingUtil;

const io = require("socket.io-client");

const blockRendererFn = () => ({
  component: Line
});

const tabCharacter = "    ";

class PageContainer extends React.Component {
  constructor() {
    super();
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: commentStrategy,
        component: commentSpan
      },
      {
        strategy: sabetStrategy,
        component: sabetSpan
      },
      {
        strategy: rakamStrategy,
        component: rakamSpan
      },
      {
        strategy: floatStrategy,
        component: floatSpan
      },
      {
        strategy: gomlaStrategy,
        component: gomlaSpan
      },
      {
        strategy: errorFloatWordsStrategy,
        component: errorFloatWordsSpan
      },
      {
        strategy: erroridStrategy,
        component: erroridSpan
      },
      {
        strategy: floatValue1Strategy,
        component: floatValue1Span
      },
      {
        strategy: intValueStrategy,
        component: intValueSpan
      },
      {
        strategy: stringValueStrategy,
        component: stringValueSpan
      },
      {
        strategy: charStrategy,
        component: charSpan
      },
      {
        strategy: boolStrategy,
        component: boolSpan
      },
      {
        strategy: ifStrategy,
        component: ifSpan
      },
      {
        strategy: elseStrategy,
        component: elseSpan
      },
      {
        strategy: whileStrategy,
        component: whileSpan
      },
      {
        strategy: doStrategy,
        component: doSpan
      },
      {
        strategy: switchStrategy,
        component: switchSpan
      },
      {
        strategy: caseStrategy,
        component: caseSpan
      },
      {
        strategy: defaultStrategy,
        component: defaultSpan
      },
      {
        strategy: forStrategy,
        component: forSpan
      },
      {
        strategy: breakStrategy,
        component: breakSpan
      },
      {
        strategy: returnStrategy,
        component: returnSpan
      },
      {
        strategy: voidStrategy,
        component: voidSpan
      },
      {
        strategy: idStrategy,
        component: idSpan
      },
      {
        strategy: charValueStrategy,
        component: charValueSpan
      },
      {
        strategy: errorDotWordsStrategy,
        component: errorDotWordsSpan
      }
    ]);

    this.state = {
      editorState: EditorState.createEmpty(compositeDecorator),
      editorState1: EditorState.createEmpty(),
      editorState3: EditorState.createEmpty()
    };

    this.focus = () => this.refs.editor.focus();
    this.focus1 = () => this.refs.terminal.focus();
    this.focus3 = () => this.refs.assembly.focus();
    this.onChange = editorState => this.setState({ editorState: editorState });
    this.onChange1 = editorState1 =>
      this.setState({ editorState1: editorState1 });
    this.onChange3 = editorState3 =>
      this.setState({ editorState3: editorState3 });
  }

  componentWillMount() {
    this.socket = io("http://localhost:8080");

    this.socket.on("output", data => {
      if (data.false === "") {
        this.replaceDataFunction(data.correct);
      } else {
        this.replaceDataFunction(data.false);
      }
    });
  }

  myKeyBindingFn = e => {
    if (e.keyCode === 66 /* `B` key */ && hasCommandModifier(e)) {
      return "myeditor-save";
    }
    return getDefaultKeyBinding(e);
  };

  handleKeyCommand = command => {
    if (command === "myeditor-save") {
      const blocks = convertToRaw(this.state.editorState.getCurrentContent())
        .blocks;
      const value = blocks
        .map(block => (!block.text.trim() && "\n") || block.text)
        .join("\n");
      this.socket.emit("file", value);
      return "handled";
    }
    return "not-handled";
  };

  replaceDataFunction = data => {
    const currentContent = this.state.editorState.getCurrentContent();
    const firstBlock = currentContent.getBlockMap().first();
    const lastBlock = currentContent.getBlockMap().last();
    const firstBlockKey = firstBlock.getKey();
    const lastBlockKey = lastBlock.getKey();
    const lengthOfLastBlock = lastBlock.getLength();

    const selection = new SelectionState({
      anchorKey: firstBlockKey,
      anchorOffset: 0,
      focusKey: lastBlockKey,
      focusOffset: lengthOfLastBlock
    });

    const NewcurrentContent = Modifier.replaceText(
      currentContent,
      selection,
      data
    );

    this.setState({
      editorState1: EditorState.push(this.state.editorState1, NewcurrentContent)
    });
  };

  _onTab = e => {
    e.preventDefault();
    let currentState = this.state.editorState;
    let newContentState = Modifier.replaceText(
      currentState.getCurrentContent(),
      currentState.getSelection(),
      tabCharacter
    );

    this.setState({
      editorState: EditorState.push(
        currentState,
        newContentState,
        "insert-characters"
      )
    });
  };

  render() {
    return (
      <div className="d-flex flex-row bd-highlight mb-3 ">
        <div className="p-2 flex-md-row bd-highlight LeftSide">
          <Grid columns={1}>
            <Grid.Column>
              <Segment raised>
                <Image src="/images/wireframe/paragraph.png" />
                <Label as="a" color="white" ribbon>
                  Machine Language
                </Label>
                <span>
                  <div className="root">
                    <div className="editorLeft text" onClick={this.focus3}>
                      <Editor
                        readOnly="true"
                        editorState={this.state.editorState3}
                        onChange={this.onChange3}
                        ref="assembly"
                        textAlignment="left"
                        blockRendererFn={blockRendererFn}
                      />
                    </div>
                  </div>
                </span>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>
        <div className="p-2 bd-highlight rigthSide">
          <Grid columns={1}>
            <Grid.Column>
              <Segment raised>
                <Image src="/images/wireframe/paragraph.png" />
                <Label as="a" color="white" ribbon>
                  Text Editor
                </Label>
                <span>
                  <div className="root">
                    <div
                      className="editor text"
                      onClick={this.focus}
                      id="formToSave"
                    >
                      <Editor
                        editorState={this.state.editorState}
                        onChange={this.onChange}
                        onTab={this._onTab}
                        ref="editor"
                        textAlignment="left"
                        blockRendererFn={blockRendererFn}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.myKeyBindingFn}
                      />
                    </div>
                  </div>
                </span>

                <Image src="/images/wireframe/paragraph.png" />
                <Label as="a" color="black" ribbon>
                  Terminal
                </Label>
                <span>
                  <div className="root">
                    <div
                      className="editor terminal"
                      onClick={this.focus1}
                      id="formToSave"
                    >
                      <Editor
                        readOnly="true"
                        editorState={this.state.editorState1}
                        onChange={this.onChange1}
                        ref="terminal"
                        textAlignment="left"
                        blockRendererFn={blockRendererFn}
                      />
                    </div>
                  </div>
                </span>
              </Segment>
            </Grid.Column>
          </Grid>
        </div>
      </div>
    );
  }
}

function idStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.IDENTIFIER, contentBlock, callback);
}

function sabetStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.CONSTANT, contentBlock, callback);
}

function rakamStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.INT, contentBlock, callback);
}

function floatStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.FLOAT, contentBlock, callback);
}

function floatValue1Strategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.FLOATVALUE1, contentBlock, callback);
}

function gomlaStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.STRING, contentBlock, callback);
}

function voidStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.VOID, contentBlock, callback);
}

function stringValueStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.STRINGVALUE, contentBlock, callback);
}

function intValueStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.INTVALUE, contentBlock, callback);
}

function charStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.CHAR, contentBlock, callback);
}

function boolStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.BOOL, contentBlock, callback);
}

function ifStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.IF, contentBlock, callback);
}

function elseStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.ELSE, contentBlock, callback);
}

function whileStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.WHILE, contentBlock, callback);
}

function doStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.DO, contentBlock, callback);
}

function switchStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.SWITCH, contentBlock, callback);
}

function caseStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.CASE, contentBlock, callback);
}

function defaultStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.DEFAULT, contentBlock, callback);
}

function forStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.FOR, contentBlock, callback);
}

function breakStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.BREAK, contentBlock, callback);
}

function returnStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.RETURN, contentBlock, callback);
}

function charValueStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.CHARVALUE, contentBlock, callback);
}

function commentStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.COMMENT, contentBlock, callback);
}

function errorDotWordsStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.ERROR_WORDS_DOT, contentBlock, callback);
}

function errorFloatWordsStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.ERROR_FLOAT_WORDS, contentBlock, callback);
}

function erroridStrategy(contentBlock, callback, contentState) {
  findWithRegex(Regex.ERROR_IDENTIFIER, contentBlock, callback);
}

function findWithRegex(regex, contentBlock, callback) {
  const text = contentBlock.getText();
  let matchArr, start;
  while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    callback(start, start + matchArr[0].length);
  }
}

const sabetSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const rakamSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const floatSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const voidSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const intValueSpan = props => {
  return (
    <span style={styles.digits} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const floatValue1Span = props => {
  return (
    <span style={styles.digits} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const gomlaSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const stringValueSpan = props => {
  return (
    <span style={styles.string} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const charSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const boolSpan = props => {
  return (
    <span style={styles.dataTypes} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const ifSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const elseSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const whileSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const doSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const switchSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const caseSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const defaultSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const forSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const breakSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const returnSpan = props => {
  return (
    <span style={styles.blocks} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const charValueSpan = props => {
  return (
    <span style={styles.string} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const commentSpan = props => {
  return (
    <span style={styles.comment} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const erroridSpan = props => {
  return (
    <span className="zigzag" data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const errorDotWordsSpan = props => {
  return (
    <span className="zigzag" data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const errorFloatWordsSpan = props => {
  return (
    <span className="zigzag" data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const idSpan = props => {
  return (
    <span style={styles.id} data-offset-key={props.offsetKey}>
      {props.children}
    </span>
  );
};

const styles = {
  button: {
    marginTop: 10,
    textAlign: "center"
  },
  dataTypes: {
    color: "#0000ff"
  },
  digits: {
    color: "#228b22"
  },
  string: {
    color: "#b22222"
  },
  blocks: {
    color: "#1E90FF"
  },
  comment: {
    color: "#228b22"
  },
  id: {
    color: "#9932cc"
  }
};

export default PageContainer;
