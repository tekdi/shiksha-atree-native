import React, { useCallback, useState } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import globalStyles from '../../utils/Helper/Style';
import SecondaryHeader from '../../components/Layout/SecondaryHeader';
import BackHeader from '../../components/Layout/BackHeader';
import {
  calculateTotalStorageSize,
  clearDoKeys,
  deleteFilesInDirectory,
  deleteSavedItem,
  getDataFromStorage,
  logEventFunction,
} from '../../utils/JsHelper/Helper';
import GlobalText from '@components/GlobalText/GlobalText';
import { useTranslation } from '../../context/LanguageContext';
import {
  CommonActions,
  useFocusEffect,
  useNavigation,
} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import BackButtonHandler from '../../components/BackNavigation/BackButtonHandler';
import InAppBrowser from 'react-native-inappbrowser-reborn';
import FullPagePdfModal from '../RegisterScreen/FullPagePdfModal';
import PropTypes from 'prop-types';
import { NotificationUnsubscribe } from '../../utils/Helper/JSHelper';
import { useInternet } from '../../context/NetworkContext';

const OtherSettings = ({ route }) => {
  const { age } = route.params;
  const [showContentModal, setShowContentModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [storageData, setStorageData] = useState();
  const [conentView, setConentView] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [userType, setUserType] = useState();
  const [cohortId, setCohortId] = useState();
  const { isConnected } = useInternet();

  const { t } = useTranslation();
  const navigation = useNavigation();

  const fetchData = async () => {
    const userTypes = await getDataFromStorage('userType');
    const getCohortId = await getDataFromStorage('cohortId');
    setUserType(userTypes);
    setCohortId(getCohortId);
  };
  console.log('cohortId', cohortId);

  useFocusEffect(
    useCallback(() => {
      fetchData();
      StorageSize();
    }, [navigation])
  );

  const StorageSize = async () => {
    const data = await calculateTotalStorageSize();
    setStorageData(data);
  };

  const logoutEvent = async () => {
    const obj = {
      eventName: 'logout_Event',
      method: 'button-click',
      screenName: 'Profile',
    };
    await logEventFunction(obj);
  };

  const openInAppBrowser = async () => {
    try {
      const url = 'https://pratham.org/privacy-guidelines/';
      if (await InAppBrowser.isAvailable()) {
        await InAppBrowser.open(url, {
          // Optional customization
          toolbarColor: '#6200EE',
          showTitle: true,
          enableUrlBarHiding: true,
          enableDefaultShare: true,
        });
      } else {
        console.log('');
      }
    } catch (error) {
      console.error('Error opening browser:', error);
    }
  };

  const handleLogout = () => {
    const fetchData = async () => {
      await NotificationUnsubscribe();
      await deleteSavedItem('refreshToken');
      await deleteSavedItem('Accesstoken');
      await deleteSavedItem('userId');
      await deleteSavedItem('cohortId');
      await deleteSavedItem('cohortData');
      await deleteSavedItem('weightedProgress');
      await deleteSavedItem('courseTrackData');
      await deleteSavedItem('profileData');
      await deleteSavedItem('tenantData');
      await deleteSavedItem('academicYearId');
      logoutEvent();
      // Reset the navigation stack and navigate to LoginSignUpScreen
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'LoginScreen' }],
        })
      );
    };

    fetchData();
  };

  const handleCancel = () => {
    setShowExitModal(false); // Close the modal
    setShowContentModal(false); // Close the modal
  };
  const handleContentDelete = async () => {
    await clearDoKeys();
    await deleteFilesInDirectory();
    StorageSize();
    setShowContentModal(false); // Close the modal
  };

  return (
    <>
      <SecondaryHeader logo />
      <ScrollView style={globalStyles.container}>
        <BackHeader title={'settings'} />
        <View style={styles.view}>
          <TouchableOpacity
            style={[globalStyles.flexrow, styles.borderColor]}
            onPress={() => {
              setShowContentModal(true);
            }}
          >
            <View
              style={[
                globalStyles.flexrow,
                { justifyContent: 'space-between', width: '100%' },
              ]}
            >
              <View>
                <GlobalText
                  style={[globalStyles.subHeading, { color: '#4D4639' }]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {t('remove_all_offline_content')}
                </GlobalText>
                <GlobalText
                  style={[globalStyles.subHeading]}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  ( {storageData})
                </GlobalText>
              </View>
              <Icon
                name="angle-right"
                style={{ marginHorizontal: 10 }}
                color={'#000'}
                size={30}
              />
            </View>
          </TouchableOpacity>
          {(userType === 'scp' &&
            cohortId !== '00000000-0000-0000-0000-000000000000') ||
          !isConnected ? (
            <></>
          ) : (
            <>
              {/* <TouchableOpacity
                style={[globalStyles.flexrow, styles.borderColor]}
                onPress={() => {
                  navigation.navigate('ProfileUpdateScreen');
                }}
              >
                <View
                  style={[
                    globalStyles.flexrow,
                    { justifyContent: 'space-between', width: '100%' },
                  ]}
                >
                  <GlobalText
                    style={[globalStyles.subHeading, { color: '#4D4639' }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {t('edit_profile')}
                  </GlobalText>
                  <Icon
                    name="angle-right"
                    style={{ marginHorizontal: 10 }}
                    color={'#000'}
                    size={30}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.flexrow, styles.borderColor]}
                onPress={() => {
                  navigation.navigate('ResetUsername');
                }}
              >
                <View
                  style={[
                    globalStyles.flexrow,
                    { justifyContent: 'space-between', width: '100%' },
                  ]}
                >
                  <GlobalText
                    style={[globalStyles.subHeading, { color: '#4D4639' }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {t('change_username')}
                  </GlobalText>
                  <Icon
                    name="angle-right"
                    style={{ marginHorizontal: 10 }}
                    color={'#000'}
                    size={30}
                  />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[globalStyles.flexrow, styles.borderColor]}
                onPress={() => {
                  navigation.navigate('ResetPassword');
                }}
              >
                <View
                  style={[
                    globalStyles.flexrow,
                    { justifyContent: 'space-between', width: '100%' },
                  ]}
                >
                  <GlobalText
                    style={[globalStyles.subHeading, { color: '#4D4639' }]}
                    numberOfLines={2}
                    ellipsizeMode="tail"
                  >
                    {t('change_password')}
                  </GlobalText>
                  <Icon
                    name="angle-right"
                    style={{ marginHorizontal: 10 }}
                    color={'#000'}
                    size={30}
                  />
                </View>
              </TouchableOpacity> */}
            </>
          )}
          {/* <TouchableOpacity
            style={[globalStyles.flexrow, styles.borderColor]}
            onPress={openInAppBrowser}
          >
            <View
              style={[
                globalStyles.flexrow,
                { justifyContent: 'space-between', width: '100%' },
              ]}
            >
              <GlobalText
                style={[globalStyles.subHeading, { color: '#4D4639' }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {t('privacy_guidelines')}
              </GlobalText>
              <Icon
                name="angle-right"
                style={{ marginHorizontal: 10 }}
                color={'#000'}
                size={30}
              />
            </View>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            style={[globalStyles.flexrow, styles.borderColor]}
            onPress={() => {
              setModalVisible(true);
            }}
          >
            <View
              style={[
                globalStyles.flexrow,
                { justifyContent: 'space-between', width: '100%' },
              ]}
            >
              <GlobalText
                style={[globalStyles.subHeading, { color: '#4D4639' }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {t('consent_form')}
              </GlobalText>
              <Icon
                name="angle-right"
                style={{ marginHorizontal: 10 }}
                color={'#000'}
                size={30}
              />
            </View>
          </TouchableOpacity> */}
          {/* <TouchableOpacity
            style={[
              globalStyles.flexrow,
              styles.borderColor,
              { borderBottomWidth: 0 },
            ]}
            onPress={() => {
              navigation.navigate('SupportRequest');
            }}
          >
            <View
              style={[
                globalStyles.flexrow,
                { justifyContent: 'space-between', width: '100%' },
              ]}
            >
              <GlobalText
                style={[globalStyles.subHeading, { color: '#4D4639' }]}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {t('contact_us')}
              </GlobalText>
              <Icon
                name="angle-right"
                style={{ marginHorizontal: 10 }}
                color={'#000'}
                size={30}
              />
            </View>
          </TouchableOpacity> */}
        </View>
        <TouchableOpacity
          style={[globalStyles.flexrow, styles.logout]}
          onPress={() => {
            setShowExitModal(true);
          }}
        >
          <MaterialIcons
            name="logout"
            color="black"
            size={25}
            style={styles.icon}
          />

          <GlobalText style={[globalStyles.subHeading, { marginLeft: 15 }]}>
            {t('logout')}
          </GlobalText>
        </TouchableOpacity>
        {showExitModal && (
          <BackButtonHandler
            logout
            exitRoute={true} // You can pass any props needed by the modal here
            onCancel={handleCancel}
            onExit={handleLogout}
          />
        )}
        {showContentModal && (
          <BackButtonHandler
            content_delete
            exitRoute={true} // You can pass any props needed by the modal here
            onCancel={handleCancel}
            onExit={handleContentDelete}
          />
        )}
        <FullPagePdfModal
          // pdfPath={pdfPath}
          isModalVisible={isModalVisible}
          setModalVisible={setModalVisible}
          age={age}
        />
        <Modal transparent={true} animationType="fade" visible={conentView}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.alertBox}>
                <Ionicons
                  name="information-circle-outline"
                  size={25}
                  color={'#1170DC'}
                />
                <GlobalText
                  allowFontScaling={false}
                  style={[
                    globalStyles.subHeading,
                    {
                      textAlign: 'center',
                      marginVertical: 20,
                    },
                  ]}
                >
                  {t('content_delete_desp')}
                </GlobalText>
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setConentView(false);
                  }}
                >
                  <GlobalText
                    allowFontScaling={false}
                    style={[globalStyles.subHeading, { color: '#0D599E' }]}
                  >
                    {t('okay')}
                  </GlobalText>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 20,
    borderColor: '#D0C5B4',
  },
  borderColor: {
    borderColor: '#D0C5B4',
    flexWrap: 'wrap',
    padding: 10,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  logout: {
    borderWidth: 1,
    // alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginVertical: 10,
    borderRadius: 20,
  },
});

OtherSettings.propTypes = {
  route: PropTypes.any,
};

export default OtherSettings;
