import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {addApp, closeApp} from '@phone/actions/apps.actions';
import styles from '../phone.module.scss';
import BottomPanel from "@phone/components/BottomPanel";
import house_icon from '@imgs/phone/house.svg';
import biz_icon from '@imgs/phone/biz.svg';
import bank_icon from '@imgs/phone/bank.svg';
import call_story_icon from '@imgs/phone/callStory.svg';
import taxi_client_icon from '@imgs/phone/taxi_client.svg';
import taxi_driver_icon from '@imgs/phone/taxi_driver.svg';
import news_icon from '@imgs/phone/news.svg';
import PhoneAppIcon from "./PhoneAppIcon";
import HouseApp from "./house/HouseApp";
import BusinessApp from "./biz/BusinessApp";
import BankApp from "./bank/BankApp";
import News from "./news/News";
import TaxiClient from "./taxi_app/taxi_client/TaxiClient";
import TaxiDriver from "./taxi_app/taxi_driver/TaxiDriver";
import CallStory from "./calls/story/CallStory";

const MainDisplay = ({ addAppAction, info }) => {
    return (
        <div className={styles.app} style={{ backgroundColor: 'transparent' }}>
            <div className={styles.container}>
                <div className={styles.apps}>
                    <PhoneAppIcon
                        app={<CallStory />}
                        name='Недавние'
                        image={call_story_icon}
                        handleClick={addAppAction}
                    />
                    <PhoneAppIcon
                        app={<BankApp />}
                        name='Банк'
                        image={bank_icon}
                        handleClick={addAppAction}
                    />
                    <PhoneAppIcon
                        app={<News />}
                        name='Новости'
                        image={news_icon}
                        handleClick={addAppAction}
                    />
                    <PhoneAppIcon
                        app={<TaxiClient />}
                        name='Такси'
                        image={taxi_client_icon}
                        handleClick={addAppAction}
                    />
                    {
                        info.isDriver &&
                        <PhoneAppIcon
                            app={<TaxiDriver />}
                            name='Такси'
                            image={taxi_driver_icon}
                            handleClick={addAppAction}
                        />
                    }
                    {
                        info.houses.length > 0 &&
                        <PhoneAppIcon
                            app={<HouseApp />}
                            name='Дом'
                            image={house_icon}
                            handleClick={addAppAction}
                        />
                    }
                    {
                        info.biz.length > 0 &&
                        <PhoneAppIcon
                            app={<BusinessApp />}
                            name='Бизнес'
                            image={biz_icon}
                            handleClick={addAppAction}
                        />
                    }
                </div>
            </div>

            <BottomPanel handleClick={addAppAction} />
        </div>
    );
};

const mapStateToProps = state => ({
   apps: state.apps,
   info: state.info
});

const mapDispatchToProps = dispatch => ({
   addAppAction: app => dispatch(addApp(app))
});

export default connect(mapStateToProps, mapDispatchToProps)(MainDisplay);