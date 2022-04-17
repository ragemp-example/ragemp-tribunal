/* eslint-disable default-case */
import React, {Fragment} from 'react';
import { connect } from 'react-redux';
import { setOpacityChat, setFocusChat, pushMessage, setTagsChat, showChat } from '../actions/action.chat';
import '../styles/chat.css';

class Chat extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            currentMessage: '',
            index: 0,
            curTagIndex: 0,
            opacity: 1,
            isMyMessage: false
        };

        this.history = [];

        this.sendMessage = this.sendMessage.bind(this);
        this.keyDownInput = this.keyDownInput.bind(this);
        this.keyUpInput = this.keyUpInput.bind(this);
        this.pastePrevMessage = this.pastePrevMessage.bind(this);
        this.pasteNextMessage = this.pasteNextMessage.bind(this);
        this.handleChangeInput = this.handleChangeInput.bind(this);
    }

    componentDidMount() {
        // for (let i = 0; i < 20; i++) {
        //     this.props.pushMessage('hii');
        // }
        
        // this.props.setFocusChat(true);

        // setInterval(() => {
        //     this.props.pushMessage('message');
        // }, 4000);
    }

    componentWillUpdate() {
        if (this.refList.scrollHeight - this.refList.scrollTop === this.refList.clientHeight) {
            if (!this.state.isScroll) {
                this.setState({ isScroll: true });
            }
        }
    }

    componentDidUpdate() {
        const list = this.refList;
        const { chat } = this.props;
        const { isMyMessage, isScroll } = this.state;

        if (chat.isFocus) {
            list.style.overflowY = 'auto';

            if (isMyMessage) {
                this.scrollToBottom();
                this.setState({ isMyMessage: false });
            } else {
                if (isScroll) {
                    this.scrollToBottom();
                    this.setState({ isScroll: false });
                }
            }
        } else {
            list.style.overflowY = 'hidden';
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const scrollHeight = this.refList.scrollHeight;
        const height = this.refList.clientHeight;
        const maxScrollTop = scrollHeight - height;
        this.refList.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
    }

    handleChangeInput(e) {
        this.setState({ currentMessage: e.target.value })
    }

    getMessage(index, message) {
        const { chat } = this.props;

        return (
            <div key={index} className='message-chat-react'>
                { chat.time &&
                <span style={{ color: message.text[0].color }} className="word-chat-react">
                    { message.time }
                </span> }
                {
                    message.text.map((word, ind) => (
                        <span style={{ color: word.color }} key={ind*10 + ind + 1} className="word-chat-react">
                            { word.text }
                        </span>
                    ))
                }
            </div>
        )
    }

    sendMessage(event) {
        const { curTagIndex, currentMessage, opacity } = this.state;
        const { chat, setFocusChat, setOpacityChat } = this.props;

        event.preventDefault();

        if(currentMessage) {
            this.history.push(currentMessage);
            this.setState({index: this.history.length, isMyMessage: true});
            // eslint-disable-next-line no-undef
            mp.trigger('chat.message.get', chat.tags[curTagIndex].id, currentMessage);
            this.setState({ currentMessage: '' });
        }

        setFocusChat(false);
        setOpacityChat(opacity);
        // eslint-disable-next-line no-undef
        mp.trigger('chat.close');
    }

    pastePrevMessage() {
        const { index, currentMessage } = this.state;

        if(index > 0) {
            if(index === this.history.length) {
                this.setState({firstMessage: this.refInput.value})
            }

            this.setState({ index: index - 1, currentMessage: this.history[index - 1] })
        }
    }

    pasteNextMessage() {
        const { index, firstMessage } = this.state;
        if(index < this.history.length - 1) {
             this.setState({ index: index + 1, currentMessage: this.history[index + 1] })
        } else if(index === this.history.length - 1){
            this.setState({ index: index + 1, currentMessage: firstMessage })
        }
    }

    changeType() {
        const { curTagIndex } = this.state;
        const { chat } = this.props;

        if(curTagIndex < chat.tags.length - 1) {
            this.setState({curTagIndex: curTagIndex + 1});
        } else {
            this.setState({curTagIndex: 0})
        }
    }

    keyDownInput(event) {
        let code = event.keyCode;
        switch (code) {
            case 13:
                this.sendMessage(event);
                break;
            case 38:
                event.preventDefault();
                this.pastePrevMessage();
                break;
            case 40:
                event.preventDefault();
                this.pasteNextMessage();
                break;
            case 9:
                event.preventDefault();
                this.changeType();
                break;
        }
    }

    keyUpInput(event) {
        event.preventDefault();
        const { chat, setFocusChat, setOpacityChat } = this.props;

        let code = event.keyCode;
        if(code === 27) {
            setFocusChat(false);
            setOpacityChat(this.state.opacity);
            // eslint-disable-next-line no-undef
            mp.trigger('chat.close');
        }
    }

    focusInput(event) {
        const { chat, setOpacityChat } = this.props;

        this.setState({opacity: chat.opacity});
        setOpacityChat(1);
    }

    render() {
        const { chat } = this.props;
        const { curTagIndex } = this.state;

        if (chat.isShow) {
            return (
                <div id="chat-form-react" style={{ opacity: chat.opacity, fontSize: `${chat.size * 1.6}vh` }}>

                    <ul id="message-list-chat-react" ref={(list) => {this.refList = list}} style={{ height: `${chat.size * 25}vh` }}>
                        {
                            chat.messages.map((message, index) => (
                                this.getMessage(index, message)
                            ))
                        }
                    </ul>

                    {chat.isFocus &&
                    <div className='block-input-chat-react' style={{ width: `${chat.size * 80}%` }}>
                        <div className="tag-chat-react">
                            <span style={{ color: chat.tags[curTagIndex].color }}>
                                { chat.tags[curTagIndex].name }
                            </span>
                        </div>
                        <input
                            type='text'
                            value={this.state.currentMessage}
                            onChange={this.handleChangeInput}
                            ref={(input) => {this.refInput = input}}
                            placeholder='Введите сообщение'
                            id="chat-message-input-react"
                            onKeyDown={this.keyDownInput}
                            onKeyUp={this.keyUpInput}
                            onFocus={this.focusInput.bind(this)}
                            onBlur={() => {this.refInput.focus()}}
                            autoFocus={true}
                            style={{ fontSize: `${chat.size * 1.6}vh` }}
                        >
                        </input>
                    </div>}
                </div>
            )
        } else  {
            return <div></div>
        }
    }
}

const mapStateToProps = state => ({
    chat: state.chat
});

const mapDispatchToProps = dispatch => ({
    setOpacityChat: opacity => dispatch(setOpacityChat(opacity)),
    setFocusChat: param => dispatch(setFocusChat(param)),
    pushMessage: mes => dispatch(pushMessage(mes)),
    setTagsChat: tags => dispatch(setTagsChat(tags)),
    showChat: param => dispatch(showChat(param))
});

export default connect(mapStateToProps, mapDispatchToProps)(Chat)