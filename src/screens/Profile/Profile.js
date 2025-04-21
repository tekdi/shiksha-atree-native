import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from '../../context/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import Label from '../../components/Label/Label';
import TextField from '../../components/TextField/TextField';
import ActiveLoading from '../../screens/LoadingScreen/ActiveLoading';
import {
  capitalizeFirstLetter,
  capitalizeName,
  createNewObject,
  getDataFromStorage,
  getTentantId,
  logEventFunction,
  setDataInStorage,
} from '../../utils/JsHelper/Helper';
import globalStyles from '../../utils/Helper/Style';
import SecondaryHeader from '../../components/Layout/SecondaryHeader';

import LinearGradient from 'react-native-linear-gradient';
import NoCertificateBox from './NoCertificateBox';
import GlobalText from '@components/GlobalText/GlobalText';
import DeviceInfo from 'react-native-device-info';
import Config from 'react-native-config';
import { getProfileDetails, getStudentForm } from '../../utils/API/AuthService';
import { useInternet } from '../../context/NetworkContext';
import NetworkAlert from '../../components/NetworkError/NetworkAlert';

const Profile = () => {
  const { t, language } = useTranslation();
  const [userData, setUserData] = useState();
  const [userDetails, setUserDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isConnected } = useInternet();
  const [networkstatus, setNetworkstatus] = useState(true);
  const [userType, setUserType] = useState();
  const [cohortId, setCohortId] = useState();
  const version = DeviceInfo.getVersion(); // e.g., "1.0.1"
  const buildNumber = DeviceInfo.getBuildNumber(); // e.g., "2"
  const convertObjectToArray = (data) => {
    let location = {};

    const transformedArray = Object.entries(data).reduce(
      (acc, [name, value]) => {
        if (['states', 'districts', 'blocks'].includes(name)) {
          location = `${value.label},`; // Store in location object
        } else if (
          typeof value === 'object' &&
          value !== null &&
          !Array.isArray(value)
        ) {
          acc.push({ name, value: value.value, label: value.label });
        } else {
          acc.push({ name, value });
        }
        return acc;
      },
      []
    );

    // Push the location object into the array
    if (Object.keys(location).length) {
      transformedArray.push({ name: 'location', value: location });
    }

    return transformedArray;
  };

  const fetchData = async () => {
    // const data = await getStudentForm();
    // setDataInStorage('studentForm', JSON.stringify(data?.fields));
    const tenantId = await getDataFromStorage('userTenantid');

    // const studentForm = data?.fields;
    // const programFormData = await getStudentForm(tenantId);

    // const studentProgramForm = programFormData?.fields;
    // setDataInStorage('studentProgramForm', JSON.stringify(studentProgramForm));
    // const mergedForm = [...studentForm, ...studentProgramForm];
    const user_id = await getDataFromStorage('userId');
    const profileData = await getProfileDetails({
      userId: user_id,
    });
    const result = profileData;
    await setDataInStorage('profileData', JSON.stringify(profileData));

    const finalResult = result?.getUserDetails?.[0];
    const keysToRemove = [
      'customFields',
      'total_count',
      'status',
      'updatedAt',
      'createdAt',
      'updatedBy',
      'createdBy',
      'role',
      'userId',
      'username',
      'firstName',
      'middleName',
      'lastName',
    ];

    const filteredResult = Object.keys(finalResult)
      .filter((key) => !keysToRemove.includes(key))
      .reduce((obj, key) => {
        obj[key] = finalResult[key];
        return obj;
      }, {});
    // const requiredLabels = mergedForm?.map((item) => {
    //   return { label: item?.label, name: item?.name };
    // });
    // const customFields = finalResult?.customFields;
    // const userDetails = createNewObject(
    //   customFields,
    //   requiredLabels,
    //   (profileView = true)
    // );

    // Extract state, district, and block
    const locationData = {
      states: userDetails.state?.label || '',
      districts: userDetails.district?.label || '',
      blocks: userDetails.block?.label || '',
      village: userDetails.village?.label || '',
    };

    // Convert location data into a single formatted string
    const formattedLocation =
      `${locationData.states}, ${locationData.districts}, ${locationData.blocks}, ${locationData.village}`.trim();

    // Remove states, districts, and blocks from userDetails
    delete userDetails.state;
    delete userDetails.district;
    delete userDetails.block;

    // Add formatted location as a new field
    userDetails.location = formattedLocation;

    const UpdatedObj = { ...userDetails, ...filteredResult };
    const newUpdatedObj = convertObjectToArray(UpdatedObj);
    setUserData(result?.getUserDetails?.[0]);

    setUserDetails(newUpdatedObj);

    // const tenantData = await getTentantId();

    setLoading(false);
    setNetworkstatus(true);
  };

  console.log('userdetails', JSON.stringify(userDetails.length));

  useFocusEffect(
    useCallback(() => {
      console.log('isConnected', isConnected);

      if (isConnected) {
        fetchData();
        setNetworkstatus(true);
      } else if (!isConnected && userDetails.length === 0) {
        setNetworkstatus(false);
      } else {
        setNetworkstatus(true);
      }
    }, []) // Correct dependencies
  );

  useEffect(() => {
    const logEvent = async () => {
      const obj = {
        eventName: 'profile_page_view',
        method: 'on-view',
        screenName: 'Profile',
      };
      await logEventFunction(obj);
    };
    logEvent();
  }, []);

  const getDate = () => {
    const date = new Date(userData?.createdAt);
    const day = date?.toLocaleDateString(language, {
      day: 'numeric',
    });
    const month = date?.toLocaleDateString(language, {
      month: 'long',
    });
    const year = date?.toLocaleDateString(language, {
      year: 'numeric',
    });

    return ` ${month} ${day}, ${year}`; // Format as "26 October 2024"
  };

  // Refresh the component.
  const handleRefresh = async () => {
    setLoading(true); // Start Refresh Indicator

    try {
      fetchData(); // Reset course data
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop Refresh Indicator
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <SecondaryHeader logo />
      {loading ? (
        <ActiveLoading />
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
          }
          style={[globalStyles.container, { padding: 0 }]}
        >
          <View style={styles.view}>
            <GlobalText style={globalStyles.heading}>
              {t('my_profile')}
            </GlobalText>

            <TouchableOpacity
              onPress={() => {
                navigation.navigate('OtherSettings', {
                  age: userDetails?.AGE,
                });
              }}
            >
              <Ionicons name="settings-outline" size={30} color={'#000'} />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={['#FFFDF6', '#F8EFDA']} // Gradient colors
            start={{ x: 1, y: 0 }} // Gradient starting point
            end={{ x: 1, y: 1.5 }} // Gradient ending point
            style={styles.gradient}
          >
            <GlobalText style={[globalStyles.subHeading, { fontWeight: 700 }]}>
              {capitalizeName(
                `${userData?.firstName} ${
                  userData?.lastName ? userData?.lastName : ''
                }`
              )}
            </GlobalText>
            <View
              style={[
                globalStyles.flexrow,
                { justifyContent: 'space-between' },
              ]}
            >
              <GlobalText style={globalStyles.text}>
                {userData?.username}
              </GlobalText>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 20,
                  backgroundColor: '#CDC5BD',
                }}
              />
              <View style={[globalStyles.flexrow]}>
                <GlobalText style={globalStyles.text}>
                  {t('joined_on')}
                </GlobalText>
                <GlobalText style={globalStyles.text}> {getDate()}</GlobalText>
              </View>
            </View>
          </LinearGradient>
          {/* <NoCertificateBox userType={userType} /> */}
          <View style={{ backgroundColor: '#FFF8F2', paddingVertical: 20 }}>
            <View style={styles.viewBox}>
              {/* {userDetails?.map((item, key) => {
                return (
                  <View key={key} style={{ paddingVertical: 10 }}>
                    <Label text={`${t(item?.name)}`} />
                    <TextField text={item?.value} />
                  </View>
                );
              })}
*/}
              <View>
                <Label text={`${t('email')}`} />
                <TextField text={`${userData?.email || '-'}   `} />
              </View>

              <View>
                <Label text={`${t('class')} (${t('last_passed_grade')})`} />
                <TextField text={userDetails?.CLASS_OR_LAST_PASSED_GRADE} />
              </View>
              <View>
                <Label text={`${t('dob')} `} />

                <TextField text={userData?.dob} />
              </View>
              <View>
                <Label text={`${t('gender')} `} />
                <TextField
                  text={`${capitalizeFirstLetter(userData?.gender)}`}
                />
              </View>
              <View>
                <Label text={`${t('location')}`} />
                {userDetails?.STATE ? (
                  <TextField
                    text={`${userDetails?.STATE || '-'},  ${
                      userDetails?.DISTRICT || ''
                    }, ${userDetails?.BLOCK || ''}`}
                  />
                ) : (
                  <TextField text={'-'} />
                )}
              </View>
            </View>
          </View>

          <GlobalText
            style={[
              globalStyles.text,
              { textAlign: 'center', paddingVertical: 10 },
            ]}
          >
            Version {version} (Build {buildNumber})
            {Config.ENV != 'PROD' ? Config.ENV : ''}
          </GlobalText>
        </ScrollView>
      )}
      <NetworkAlert
        onTryAgain={fetchData}
        isConnected={networkstatus}
        closeModal={() => {
          setNetworkstatus(!networkstatus);
        }}
      />
    </SafeAreaView>
  );
};

Profile.propTypes = {};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  view: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  viewBox: {
    borderWidth: 1,
    borderRadius: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    padding: 20,
    borderColor: '#D0C5B4',
  },
  img: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  gradient: {
    padding: 20,
    // marginBottom: 20,
  },

  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  alertBox: {
    padding: 20,
    alignItems: 'center',
  },
  buttonContainer: {
    width: '100%',
    borderTopWidth: 1,
    borderColor: '#D0C5B4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: '50%',
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
