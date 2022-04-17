import {CONTACTS, DIALOGS} from "./types";

const initialState = [
    // {
    //     name: 'Данила',
    //     number: '134432',
    //     PhoneMessages: [
    //         {
    //             text: 'ты как',
    //             isMine: false,
    //             date: Date.now()
    //         },
    //         {
    //             text: '?',
    //             isMine: false
    //         },
    //         {
    //             text: 'пиздец меня разъебало вчера',
    //             isMine: true
    //         },
    //         {
    //             text: 'ну ясен хуй епт',
    //             isMine: false
    //         },
    //         {
    //             text: 'унесло так унесло',
    //             isMine: true,
    //         },
    //         {
    //             text: 'я думал вообще откинусь ))000 ладно хоть не блевал',
    //             isMine: true,
    //             date: Date.now()
    //         },
    //         // {
    //         //     text: 'ввхвхвхdgshhssssssskkdawawd',
    //         //     isMine: true
    //         // },
    //     ]
    // },
    // {
    //     name: null,
    //     number: '1111',
    //     PhoneMessages: [
    //         {
    //             text: 'ты как',
    //             isMine: false
    //         },
    //         {
    //             text: '?',
    //             isMine: false
    //         },
    //         {
    //             text: 'пиздец меня разъебало вчера',
    //             isMine: true
    //         },
    //         {
    //             text: 'ну ясен хуй епт',
    //             isMine: false
    //         },
    //         {
    //             text: 'унесло так унесло',
    //             isMine: true
    //         },
    //         {
    //             text: 'я думал вообще откинусь ))000 ладно хоть не блевал',
    //             isMine: true
    //         },
    //         {
    //             text: '121в',
    //             isMine: true,
    //             date: Date.now()
    //         },
    //     ]
    // },
    // {
    //     name: 'Влад',
    //     number: '111',
    //     PhoneMessages: [
    //         {
    //             text: 'ты как',
    //             isRead: true,
    //             isMine: false
    //         },
    //         {
    //             text: '?',
    //             isRead: true,
    //             isMine: false
    //         },
    //         {
    //             text: 'пиздец меня разъебало вчера',
    //             isRead: true,
    //             isMine: true
    //         },
    //         {
    //             text: 'ну ясен хуй епт',
    //             isRead: true,
    //             isMine: false
    //         },
    //         {
    //             text: 'awdddddddddddddddddddddddddawdawawdaw',
    //             isRead: true,
    //             isMine: true
    //         },
    //         {
    //             text: 'awdddddddddddddddddddddddddawdawawdaw',
    //             isRead: false,
    //             isMine: false
    //         },
    //         {
    //             text: 'в',
    //             isMine: false,
    //             isRead: false,
    //             date: Date.now()
    //         },
    //     ]
    // },
];

export default (state = initialState, action) => {
    const { type, payload } = action;

    switch (type) {
        case DIALOGS.LOAD:
            return payload;

        case DIALOGS.ADD:
            return [
                ...state,
                {...payload, PhoneMessages: []}
            ];

        case DIALOGS.READ:
            return state.map(dialog => {
                if (dialog.number === payload) {
                    return {
                        ...dialog,
                        PhoneMessages: dialog.PhoneMessages.map(message => {
                            return { ...message, isRead: true }
                        })
                    }
                }

                return dialog;
            });

        case DIALOGS.ADD_MESSAGE:
            if (!state.find(dialog => dialog.number === payload.number)) {
                return [
                    ...state,
                    {
                        name: '',
                        number: payload.number,
                        PhoneMessages: [
                            {
                                text: payload.text,
                                isMine: payload.isMine,
                                isRead: payload.isRead,
                                date: Date.now()
                            }
                        ]
                    }
                ]
            }

            return state.map(dialog => {
                if (dialog.number === payload.number) {
                    return {
                        ...dialog,
                        PhoneMessages: [
                            ...dialog.PhoneMessages,
                            {
                                text: payload.text,
                                isMine: payload.isMine,
                                isRead: payload.isRead,
                                date: Date.now()
                            }
                        ]
                    }
                }

                return dialog;
            });

        case DIALOGS.RENAME:
        case CONTACTS.UPDATE:
            return state.map(dialog => {
                if (dialog.number === payload.number) {
                    return {
                        ...dialog,
                        name: payload.newName
                    }
                }

                return dialog;
            })

        case DIALOGS.REMOVE:
            return state.filter(dialog => dialog.number !== payload);

    }

    return state;
}

