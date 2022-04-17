import React, {Fragment} from 'react';
import PhoneAppIcon from "./PhoneAppIcon";
import Call from "@phone/components/calls/Call";
import Dialogs from "@phone/components/dialogs/Dialogs";
import Contacts from "@phone/components/contacts/Contacts";

import styles from '@phone/phone.module.scss';

import call from '@imgs/phone/call.svg';
import dialogs from '@imgs/phone/dialogs.svg';
import contacts from '@imgs/phone/contacts.svg';

const BottomPanel = ({ handleClick, messages }) => {
    return (
        <Fragment>
            <div className={styles.bottomPanel}>
                <PhoneAppIcon
                    image={contacts}
                    handleClick={handleClick}
                    app={<Contacts/>}
                />
                <PhoneAppIcon
                    image={call}
                    handleClick={handleClick}
                    app={<Call />}
                />
                <PhoneAppIcon
                    image={dialogs}
                    handleClick={handleClick}
                    app={<Dialogs/>}
                    notifs={messages}
                />
            </div>
        </Fragment>
    );
};

export default BottomPanel;