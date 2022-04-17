/* eslint-disable no-undef */
/* eslint-disable no-fallthrough */
/* eslint-disable default-case */
import $ from 'jquery';
import {BANK_APP, BIZ, CONTACTS, HOUSE} from "./types";

const initialState = {
    // name: 'Dun Hill',
    // isHave: true,
    // isLoad: true,
    // symbolPriceNews: 8,
    // isDriver: true,
    // contacts: [
    //     {
    //         name: 'Влад Кузнецов',
    //         number: '773631'
    //     },
    //     {
    //         name: 'Данила',
    //         number: '134432'
    //     },
    //     {
    //         name: 'Диман Тихонов',
    //         number: '123'
    //     },
    //     {
    //         name: 'Влад Кузнецов',
    //         number: '773631'
    //     },
    //     {
    //         name: 'данила',
    //         number: '134432'
    //     },
    //     {
    //         name: 'Диман',
    //         number: '123'
    //     },
    // ],
    // houses: [
    //     {
    //         name: 228,
    //         area: 'Санта-Моника',
    //         class: 'Люкс',
    //         numRooms: 4,
    //         garage: true,
    //         carPlaces: 2,
    //         rent: 350,
    //         price: 45000,
    //         isOpened: true,
    //         days: 4,
    //         improvements: [
    //             {
    //                 name: 'Сигнализация',
    //                 price: 300,
    //                 isBuyed: true,
    //             },
    //             {
    //                 name: 'Шкаф',
    //                 price: 150,
    //                 isBuyed: false,
    //             },
    //             {
    //                 name: 'Сигнализация',
    //                 price: 300,
    //                 isBuyed: true,
    //             },
    //             {
    //                 name: 'Шкаф',
    //                 price: 150,
    //                 isBuyed: false,
    //             }
    //         ]
    //     }
    // ],
    // biz: [
    //     {
    //         id: 3,
    //         name: 'Ponsonbys',
    //         type: 'Магазин одежды',
    //         cashBox: 732101,
    //         area: 'Палето Бэй',
    //         days: 5,
    //         rent: 50,
    //         resourcesMax: 2000,
    //         resources: 228,
    //         resourcePriceMin: 10,
    //         resourcePriceMax: 50,
    //         price: 112000,
    //         // order: {
    //         //     productsCount: 10,
    //         //     productsPrice: 200
    //         // },
    //         improvements: [
    //             {
    //                 name: 'Доп. склад',
    //                 price: 1000,
    //                 isBuyed: false
    //             }
    //         ],
    //         statistics: [
    //             {
    //                 date: new Date(2019, 6, 10),
    //                 money: 339
    //             },
    //             {
    //                 date: new Date(2019, 6, 11),
    //                 money: 333
    //             },
    //             {
    //                 date: new Date(2019, 6, 12),
    //                 money: 111
    //             },
    //             {
    //                 date: new Date(2019, 6, 13),
    //                 money: 234
    //             },
    //         ]
    //     }
    // ],
    // callStory: [
    //     {
    //         number: '323223',
    //         type: 1,
    //         date: Date.now()
    //     },
    //     {
    //         number: '134432',
    //         type: 0,
    //         date: Date.now()
    //     },
    //     {
    //         number: '123',
    //         type: 1,
    //         date: Date.now()
    //     },
    //     {
    //         number: '6667787',
    //         type: 2,
    //         date: new Date('1995-12-17')
    //     },
    // ]
};

let phoneIsShow = false;
let phoneIsShow2 = false;

export default function info(state = initialState, action) {

    const {type, payload} = action;
    var newState;

    switch (type) {
        case 'SHOW_PHONE':
            phoneIsShow = payload;

            if (!payload && state.incomingCall.state) {
                // eslint-disable-next-line no-undef
                mp.trigger('phone.call.in.ans', 0);
                phoneIsShow2 = false;

                return {
                    ...state,
                    incomingCall: null
                }
            } else if (payload) {
                phoneIsShow2 = false;
            }

            return state;

        case 'SET_SYMBOL_PRICE_NEWS':
            return {
                ...state,
                symbolPriceNews: payload
            };

        case 'LOAD_INFO_TO_PHONE':
            return {
                ...state,
                ...payload,
                contacts: [
                    ...payload.contacts,
                    {
                        name: 'Мой номер',
                        number: payload.number
                    }
                ],
                isLoad: true
            };

        case 'DISABLED_HOME':
            return {
                ...state,
                disabled: payload
            };

        case 'SET_COLOR':
            return {
                ...state,
                color: payload
            };

        case CONTACTS.ADD:
            return {
                ...state,
                contacts: [
                    ...state.contacts,
                    payload
                ]
            };

        case 'UPDATE_MY_NUMBER':
            newState = {...state};
            let myNumberIndex = newState.contacts.findIndex(con => con.number == payload.oldNumber && con.name == 'Мой номер');

            if (myNumberIndex !== -1) {
                let deletedContacts = newState.contacts.filter(con => con.number == payload.newNumber);

                if (deletedContacts.length > 0) {
                    deletedContacts.forEach(con => {
                        let delInd = newState.contacts.findIndex(contact => contact.number == con.number);

                        if (delInd !== -1) {
                            newState.contacts.splice(delInd, 1);
                        }
                    })
                }
                newState.contacts[myNumberIndex].number = payload.newNumber;
                newState.number = payload.newNumber;
            }

            return newState;

        case CONTACTS.REMOVE:
            return {
                ...state,
                contacts: state.contacts.filter(contact => contact.number !== payload)
            }

        case CONTACTS.UPDATE:
            return {
                ...state,
                contacts: state.contacts.map(contact => {
                    if (contact.number === payload.number) {
                        return {
                            ...contact,
                            name: payload.newName
                        }
                    }

                    return contact;
                })
            }

        case 'SET_CALL_STATUS':
            if (state.incomingCall && state.incomingCall.state && phoneIsShow2) {
                $('#phone').animate({bottom: '-50%'}, 100, function () {
                    $('#phone').css({"display": "none"});
                });
                phoneIsShow2 = false;
            }

            return {
                ...state,
                incomingCall: {
                    ...state.incomingCall,
                    state: false
                },
                activeCall: {
                    ...state.activeCall,
                    callStatus: payload
                }
            }
        case 'SET_CALL':
            return {
                ...state,
                isCall: payload
            }

        case 'INCOMING_CALL':
            if (!phoneIsShow && payload.state) {
                $('#phone').animate({bottom: '-20%'}, 100);
                $('#phone').css({"display": "block"});
                phoneIsShow2 = true;
            }
            return {
                ...state,
                incomingCall: payload
            }

        case 'ACTIVE_CALL':
            return {
                ...state,
                activeCall: {
                    ...state.activeCall,
                    ...payload
                }
            }

        case 'CALL_STORY_ADD':
            return {
                ...state,
                callStory: [
                    payload,
                    ...state.callStory
                ]
            };

        case HOUSE.CHANGE_STATE:
            return {
                ...state,
                houses: state.houses.map((house, index) => {
                    if (index === 0) {
                        return {
                            ...house,
                            isOpened: !house.isOpened
                        };
                    }

                    return house;
                })
            };

        case HOUSE.SET_SELL_STATUS:
            return {
                ...state,
                houses: state.houses.map((house, index) => {
                    if (index === 0) {
                        return {
                            ...house,
                            sellStatus: payload
                        }
                    }

                    return house;
                })
            };

        case HOUSE.SET_SELL_INFO:
            return {
                ...state,
                houses: state.houses.map((house, index) => {
                    if (index === 0) {
                        return {
                            ...house,
                            ansSell: payload
                        }
                    }

                    return house;
                })
            };

        case HOUSE.SELL:
            return {
                ...state,
                houses: []
            };

        case HOUSE.BUY_IMPROVEMENT_ANS:
            return {
                ...state,
                houses: state.houses.map((house, index) => {
                    if (index === 0) {
                        return {
                            ...house,
                            buyStatus: payload
                        }
                    }

                    return house;
                })
            };

        case HOUSE.BUY_IMPROVEMENT:
            return {
                ...state,
                houses: state.houses.map((house, index) => {
                    if (index === 0) {
                        return {
                            ...house,
                            buyStatus: null,
                            improvements: house.improvements.map((imp, ind) => {
                                if (ind === house.improvements.findIndex(imp => imp.type === payload)) {
                                    return {
                                        ...imp,
                                        isBuyed: true
                                    }
                                }

                                return imp;
                            })
                        }
                    }

                    return house;
                })
            }

        case 'ADD_APP_TO_PHONE':
            const newStateAdd = {...state};

            if (payload.appName === 'house') {
                if (newStateAdd.houses) {
                    newStateAdd.houses.push(payload.info);
                } else {
                    newStateAdd.houses = [payload.info];
                }
            } else if (payload.appName === 'biz') {
                if (newStateAdd.biz) {
                    newStateAdd.biz.push(payload.info);
                } else {
                    newStateAdd.biz = [payload.info];
                }
            } else if (payload.appName === 'taxi') {
                newStateAdd.isDriver = true;
            } else if (payload.appName === 'factionBiz') {
                newStateAdd.factionBiz = payload.info
            }

            return newStateAdd;

        case 'DELETE_APP_TO_PHONE':
            const newStateRemove = {...state};

            if (payload === 'house') {
                newStateRemove.houses.length = 0;
            } else if (payload === 'biz') {
                newStateRemove.biz.length = 0;
            } else if (payload === 'taxi') {
                newStateRemove.isDriver = false;
            } else if (payload === 'factionBiz') {
                newStateRemove.factionBiz = null;
            }

            return newStateRemove;

        case BIZ.SET_SELL_STATUS:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            sellStatus: payload
                        }
                    }

                    return b;
                })
            };

        case BIZ.SET_SELL_INFO:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            ansSell: payload
                        }
                    }

                    return b;
                })
            };

        case BIZ.CREATE_ORDER:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            order: payload,
                            cashBox: b.cashBox - payload.productsPrice,
                            orderStatus: null
                        }
                    }

                    return b;
                })
            };

        case BIZ.CANCEL_ORDER:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0 && b.order !== null) {
                        return {
                            ...b,
                            order: null
                        }
                    }

                    return b;
                })
            };

        case BIZ.SET_ORDER_STATUS:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            orderStatus: payload
                        }
                    }

                    return b;
                })
            };

        case BIZ.TAKE_ORDER:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            order: {
                                ...b.order,
                                isTake: payload
                            }
                        }
                    }

                    return b;
                })
            };

        case BIZ.COMPLETE_ORDER:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        if ((b.order.productsCount - payload.count) > 0) {
                            return {
                                ...b,
                                order: {
                                    ...b.order,
                                    productsCount: b.order.productsCount - payload.count,
                                    productsPrice: b.order.productsPrice - payload.sum,
                                }
                            }
                        } else {
                            return {
                                ...b, order: null
                            }
                        }
                    }

                    return b;
                })
            };

        case BIZ.UPDATE_PRODUCTS:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            resources: payload
                        }
                    }

                    return b;
                })
            };

        case 'SELL_BUSINESS':
            const newStateSellBiz = {...state};
            let bizIndex = newStateSellBiz.biz.findIndex(biz => biz.id === payload);

            if (bizIndex !== -1) {
                newStateSellBiz.biz.splice(bizIndex, 1);
            }

            return newStateSellBiz;

        case BIZ.BUY_IMPROVEMENT_ANS:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            buyStatus: payload
                        }
                    }

                    return b;
                })
            };

        case BIZ.BUY_IMPROVEMENT:
            newState = {...state};
            let improvIndexBiz = newState.biz[0].improvements.findIndex(imp => imp.type == payload);

            if (improvIndexBiz !== -1) {
                newState.biz[0].improvements[improvIndexBiz].isBuyed = true;
                newState.biz[0].buyStatus = null;
            }

            return newState;

        case BIZ.UPDATE_CASHBOX:
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            cashBox: payload
                        }
                    }

                    return b;
                })
            };

        case BIZ.UPDATE_STATISTICS:
            newState = {...state};
            let dayIndex = newState.biz[0].statistics.findIndex(day => day.date == payload.date);
            if (dayIndex !== -1) {
                newState.biz[0].statistics[dayIndex].money = payload.money;
            } else {
                if (newState.biz[0].statistics.length === 30) {
                    newState.biz[0].statistics.pop();
                }
                newState.biz[0].statistics.unshift(payload);
            }

            return newState;

        case BANK_APP.TAXES_HOUSE:
        case 'PAY_HOUSE_BANK':
            return {
                ...state,
                houses: state.houses.map(house => {
                    if (house.name === payload.id) {
                        return {
                            ...house,
                            days: house.days + payload.days
                        }
                    }

                    return house;
                })
            };

        case BANK_APP.TAXES_BIZ:
        case 'PAY_BUSINESS_BANK':
            return {
                ...state,
                biz: state.biz.map(b => {
                    if (b.id === payload.id) {
                        return {
                            ...b,
                            days: b.days + payload.days
                        }
                    }

                    return b;
                })
            };

        case 'UPDATE_BANK':
            if (payload.biz.length === 0) return state;
            return {
                ...state,
                biz: state.biz.map((b, index) => {
                    if (index === 0) {
                        return {
                            ...b,
                            cashBox: payload.biz[0].cashBox
                        }
                    }

                    return b;
                })
            }
    }

    return state;
}
