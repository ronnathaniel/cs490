import React from 'react';
import { Editor, EditorState, getDefaultKeyBinding, RichUtils, ContentState } from 'draft-js';
import 'draft-js/dist/Draft.css';
import { Button } from 'react-bootstrap';
import {stateToHTML} from 'draft-js-export-html';

class RichTextEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            editorState: EditorState.createEmpty(),
            flag: false
        };

        this.focus = () => this.refs.editor.focus();

        this.handleKeyCommand = this._handleKeyCommand.bind(this);
        this.mapKeyToEditorCommand = this._mapKeyToEditorCommand.bind(this);
        this.toggleBlockType = this._toggleBlockType.bind(this);
        this.toggleInlineStyle = this._toggleInlineStyle.bind(this);
    }

    onChange = (editorState) => {
        this.setState({editorState});
    }

    handleSubmit = (e) => {
        e.preventDefault();

        const contentState = this.state.editorState.getCurrentContent();

        if (this.props.type.localeCompare("create_post")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                text: stateToHTML(contentState),
                tags: this.props.tags,
                song_url: this.props.song_url,
                img_url: this.props.img_url,
            })
                .then(r => {
                    console.log(r)
                    this.setState({flag: true})
                    this.props.handleRedirect(this.state.flag)
                })
                .catch(err => console.log(err));
        } else if (this.props.type.localeCompare("create_comment")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                post_id: this.props.post_id,
                text: stateToHTML(contentState),
            })
                .then(r => {
                    this.setState({flag: true})
                    this.props.handleRefresh(this.state.flag)
                })
                .catch(err => console.log(err));
        } else if (this.props.type.localeCompare("createPlaylistURI")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                playlist_uri: stateToHTML(contentState),
            })
                .then(r =>
                    null
                )
                .catch(err => console.log(err));
        }

        else if (this.props.type.localeCompare("createTrackURI")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                track_uri: stateToHTML(contentState),
            })
                .then(r =>
                    null
                )
                .catch(err => console.log(err));
        }

        else if (this.props.type.localeCompare("createArtistURI")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                artist_uri: stateToHTML(contentState),
            })
                .then(r =>
                    null
                )
                .catch(err => console.log(err));
        }
        else if (this.props.type.localeCompare("send_dm")===0) {
            this.props.callback({
                user_id: this.props.user_id,
                user_recipient_id: this.props.user_recipient_id,
                text: contentState.getPlainText('\u0001'),
            })
                .then(r => {
                        this.setState({flag: true});
                        this.props.handleRefresh(this.state.flag);
                    }
                )
                .catch(err => console.log(err));
        }
        const editorState = EditorState.push(this.state.editorState, ContentState.createFromText(''));
        this.setState({ editorState });
    }


    _handleKeyCommand(command, editorState) {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            this.onChange(newState);
            return true;
        }
        return false;
    }

    _mapKeyToEditorCommand(e) {
        if (e.keyCode === 9 /* TAB */) {
        const newEditorState = RichUtils.onTab(
            e,
            this.state.editorState,
            1, /* maxDepth */
        );
        if (newEditorState !== this.state.editorState) {
            this.onChange(newEditorState);
        }
        return;
        }
        return getDefaultKeyBinding(e);
    }

    _toggleBlockType(blockType) {
        this.onChange(
        RichUtils.toggleBlockType(
            this.state.editorState,
            blockType
        )
        );
    }

    _toggleInlineStyle(inlineStyle) {
        this.onChange(
        RichUtils.toggleInlineStyle(
            this.state.editorState,
            inlineStyle
        )
        );
    }

    render() {
        const {editorState} = this.state;

        // If the user changes block type before entering any text, we can
        // either style the placeholder or hide it. Let's just hide it now.
        let className = 'RichEditor-editor';
        var contentState = editorState.getCurrentContent();
        if (!contentState.hasText()) {
        if (contentState.getBlockMap().first().getType() !== 'unstyled') {
            className += ' RichEditor-hidePlaceholder';
        }
        }

        return (
            <div className="EditorContainer">
                <div className="RichEditor-root">
                    <BlockStyleControls
                    editorState={editorState}
                    onToggle={this.toggleBlockType}
                    />
                    <InlineStyleControls
                    editorState={editorState}
                    onToggle={this.toggleInlineStyle}
                    />
                    <div className={className} onClick={this.focus}>
                    <Editor
                        blockStyleFn={getBlockStyle}
                        customStyleMap={styleMap}
                        editorState={editorState}
                        handleKeyCommand={this.handleKeyCommand}
                        keyBindingFn={this.mapKeyToEditorCommand}
                        onChange={this.onChange}
                        placeholder="Write here..."
                        ref="editor"
                        spellCheck={true}
                    />
                    </div>
                </div>
                <Button size="small" onClick={this.handleSubmit}>Submit</Button>
            </div>
        );
    }
    }

    // Custom overrides for "code" style.
    const styleMap = {
    CODE: {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
        fontFamily: '"Inconsolata", "Menlo", "Consolas", monospace',
        fontSize: 16,
        padding: 2,
    },
    };

    function getBlockStyle(block) {
    switch (block.getType()) {
        case 'blockquote': return 'RichEditor-blockquote';
        default: return null;
    }
    }

    class StyleButton extends React.Component {
    constructor() {
        super();
        this.onToggle = (e) => {
        e.preventDefault();
        this.props.onToggle(this.props.style);
        };
    }

    render() {
        let className = 'RichEditor-styleButton';
        if (this.props.active) {
        className += ' RichEditor-activeButton';
        }

        return (
        <span className={className} onMouseDown={this.onToggle}>
            {this.props.label}
        </span>
        );
    }
    }

    const BLOCK_TYPES = [
    {label: 'H1', style: 'header-one'},
    {label: 'H2', style: 'header-two'},
    {label: 'H3', style: 'header-three'},
    {label: 'H4', style: 'header-four'},
    {label: 'H5', style: 'header-five'},
    {label: 'H6', style: 'header-six'},
    {label: 'Blockquote', style: 'blockquote'},
    {label: 'UL', style: 'unordered-list-item'},
    {label: 'OL', style: 'ordered-list-item'},
    {label: 'Code Block', style: 'code-block'},
    ];

    const BlockStyleControls = (props) => {
    const {editorState} = props;
    const selection = editorState.getSelection();
    const blockType = editorState
        .getCurrentContent()
        .getBlockForKey(selection.getStartKey())
        .getType();

    return (
        <div className="RichEditor-controls">
        {BLOCK_TYPES.map((type) =>
            <StyleButton
            key={type.label}
            active={type.style === blockType}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
            />
        )}
        </div>
    );
    };

    var INLINE_STYLES = [
    {label: 'Bold', style: 'BOLD'},
    {label: 'Italic', style: 'ITALIC'},
    {label: 'Underline', style: 'UNDERLINE'},
    {label: 'Monospace', style: 'CODE'},
    ];

    const InlineStyleControls = (props) => {
    const currentStyle = props.editorState.getCurrentInlineStyle();

    return (
        <div className="RichEditor-controls">
        {INLINE_STYLES.map((type) =>
            <StyleButton
            key={type.label}
            active={currentStyle.has(type.style)}
            label={type.label}
            onToggle={props.onToggle}
            style={type.style}
            />
        )}
        </div>
    );
};

export default RichTextEditor;
