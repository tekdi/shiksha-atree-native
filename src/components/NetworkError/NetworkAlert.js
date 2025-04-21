import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { useTranslation } from '../../context/LanguageContext';
import PropTypes from 'prop-types';
import globalStyles from '../../utils/Helper/Style';
import lightning from '../../assets/images/png/lightning.png';
import { Button } from '@ui-kitten/components';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import GlobalText from "@components/GlobalText/GlobalText";

const NetworkAlert = ({ isConnected, onTryAgain, closeModal }) => {
  const { t } = useTranslation();

  return (
    <Modal
      visible={!isConnected}
      transparent={true}
      animationType="slide"
      onclo
    >
      <TouchableOpacity
        style={styles.modalContainer}
        activeOpacity={1}
        onPress={closeModal} // Close the modal when pressing outside the alert box
      >
        <View style={styles.alertBox}>
          <TouchableOpacity
            activeOpacity={1} // Prevent closing the modal when clicking inside the alert box
            style={styles.alertSubBox}
          >
            <Image style={styles.img} source={lightning} resizeMode="contain" />

            <GlobalText
              style={[globalStyles.subHeading, { fontWeight: '700' }]}
            >
              {t('no_internet_connection')}
            </GlobalText>
            <GlobalText
              style={[
                globalStyles.text,
                { textAlign: 'center', marginVertical: 10 },
              ]}
            >
              {t('make_sure_wifi_or_mobile_data_is_turned_on_and_try_again')}
            </GlobalText>
          </TouchableOpacity>
          <View style={styles.btnbox}>
            <Button status="primary" style={styles.btn} onPress={onTryAgain}>
              {() => (
                <>
                  <GlobalText
                    style={[globalStyles.subHeading, { marginRight: 10 }]}
                  >
                    {t('try_again')}
                  </GlobalText>
                  <MaterialIcons name="replay" size={18} color="black" />
                </>
              )}
            </Button>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

NetworkAlert.propTypes = {
  isConnected: PropTypes.bool,
  onTryAgain: PropTypes.any,
  closeModal: PropTypes.any,
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  alertBox: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  alertSubBox: {
    padding: 20,
    alignItems: 'center',
  },
  img: {
    marginVertical: 10,
  },
  btnbox: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#D0C5B4',
    padding: 20,
  },
  btn: {
    borderRadius: 30,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default NetworkAlert;
