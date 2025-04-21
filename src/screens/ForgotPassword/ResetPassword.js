import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import {
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import globalStyles from '../../utils/Helper/Style';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import { useTranslation } from '../../context/LanguageContext';
import { login, resetPassword } from '../../utils/API/AuthService';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import PasswordField from '../../components/CustomPasswordComponent/PasswordField';
import SecondaryHeader from '../../components/Layout/SecondaryHeader';
import { getDataFromStorage } from '../../utils/JsHelper/Helper';
import GlobalText from '@components/GlobalText/GlobalText';

const ResetPassword = () => {
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [ConfirmPassword, setConfirmPassword] = useState('');
  const [userName, setuserName] = useState('');
  const [email, setEmail] = useState('');
  const [modalError, setmodalError] = useState('');
  const [modal, setmodal] = useState(false);
  const [isDisabled, setIsDisabled] = useState(true);
  const [passwordError, setPasswordError] = useState(false);
  const [oldPasswordError, setOldPasswordError] = useState(false);
  const { t } = useTranslation();
  const navigation = useNavigation();

  useEffect(() => {
    const check = async () => {
      const data = JSON.parse(await getDataFromStorage('profileData'));
      console.log(data?.getUserDetails?.[0]);

      setEmail(data?.getUserDetails?.[0]?.email);
      setuserName(data?.getUserDetails?.[0]?.username);
    };
    check();
  }, []);

  const handleOldPassword = (e) => {
    setOldPassword(e.trim());
    if (e.trim() === '') {
      setIsDisabled(true);
    } else if (ConfirmPassword == '' && password == '') {
      setIsDisabled(true);
    }
  };
  const handlePassword = (e) => {
    setPassword(e.trim());
    if (e.trim() === '') {
      setIsDisabled(true);
    } else if (ConfirmPassword !== '' && e.trim() !== ConfirmPassword) {
      setPasswordError(true);
      setIsDisabled(true);
    } else if (e.trim() === ConfirmPassword) {
      setPasswordError(false);
      setIsDisabled(false);
    }
  };

  const handleConfirmPassword = (e) => {
    setConfirmPassword(e.trim());
    if (e.trim() === '') {
      setIsDisabled(true);
    } else if (password !== e.trim()) {
      setPasswordError(true);
      setIsDisabled(true);
    } else if (password === e.trim()) {
      setPasswordError(false);
      setIsDisabled(false);
    }
  };

  const handlelogin = async () => {
    const payload = {
      username: userName,
      password: oldPassword,
    };
    console.log({ payload });

    const data = await login(payload);
    console.log({ data });

    if (data?.params?.status !== 'failed' && !data?.error) {
      resetPasswordAPi();
    } else {
      setOldPasswordError(true);
    }
  };

  const resetPasswordAPi = async () => {
    const payload = {
      newPassword: password,
    };
    const data = await resetPassword({ payload });
    if (data?.params?.err !== undefined) {
      console.log('reached');
      setmodalError(data?.params?.err);
    } else {
      console.log('reached else', data);
      setmodalError();
    }
    setmodal(true);
    console.log(data?.email);
    console.log(data?.params?.err);
  };

  function encryptEmail(email) {
    // Split the email into username and domain
    console.log({ email });

    const [emailUsername, domain] = email.split('@');

    // Check if emailUsername is valid
    if (!emailUsername || emailUsername?.length < 2) {
      return email; // Return the original email if it's too short
    }

    // Replace all but the first and last character of the username with asterisks
    const encryptedUsername =
      emailUsername.charAt(0) +
      '*'.repeat(emailUsername.length - 2) + // This will now always be >= 0
      emailUsername.charAt(emailUsername.length - 1);

    // Return the encrypted email
    return `${encryptedUsername}@${domain}`;
  }

  return (
    <>
      <SecondaryHeader />
      <KeyboardAvoidingView style={globalStyles.container}>
        <GlobalText style={[globalStyles.heading, { marginBottom: 10 }]}>
          {t('reset_password')}
        </GlobalText>
        <View style={styles.view}>
          <PasswordField
            error={false}
            field="old_password"
            onChange={handleOldPassword}
            value={oldPassword}
            autoCapitalize="none"
          />

          <PasswordField
            error={false}
            field="new_password"
            onChange={handlePassword}
            value={password}
            autoCapitalize="none"
          />
          <PasswordField
            error={false}
            field="confirm_new_password"
            onChange={handleConfirmPassword}
            value={ConfirmPassword}
            autoCapitalize="none"
          />
          {passwordError && (
            <Text
              allowFontScaling={false}
              style={{
                color: 'red',
                alignSelf: 'flex-start',
                marginBottom: 10,
                marginTop: -20,
                fontFamily: 'Poppins-Regular',
              }}
            >
              {t('Password_must_match')}
            </Text>
          )}
          {oldPasswordError && (
            <Text
              allowFontScaling={false}
              style={{
                color: 'red',
                alignSelf: 'flex-start',
                marginBottom: 10,
                marginTop: -20,
                fontFamily: 'Poppins-Regular',
              }}
            >
              {t('old_password_is_incorrect')}
            </Text>
          )}
          <PrimaryButton
            isDisabled={isDisabled}
            onPress={handlelogin}
            text={t('reset_password')}
          />
        </View>
        <View
          style={{
            position: 'relative',
            alignSelf: 'center',
            width: '100%',
          }}
        >
          <Text
            style={[
              globalStyles.text,
              { textAlign: 'center', padding: 30, color: '#0D599E' },
            ]}
            onPress={() => {
              navigation.navigate('ForgotPassword', { enableLogin: false });
            }}
          >
            {t('forgot_password')}?
          </Text>
        </View>
        <Modal visible={modal} transparent={true} animationType="slide" onclo>
          <TouchableOpacity style={styles.modalContainer} activeOpacity={1}>
            <View style={styles.alertBox}>
              <TouchableOpacity
                activeOpacity={1} // Prevent closing the modal when clicking inside the alert box
                style={styles.alertSubBox}
              >
                {modalError ? (
                  <Text
                    allowFontScaling={false}
                    style={[
                      globalStyles.subHeading,
                      { textAlign: 'center', marginVertical: 10 },
                    ]}
                  >
                    {t(modalError.toLowerCase().replace(/\s+/g, '_'))}
                  </Text>
                ) : (
                  <>
                    <Icon
                      name={'checkmark-circle-outline'}
                      size={60}
                      color="#1A8825"
                    />
                    <Text
                      allowFontScaling={false}
                      style={[
                        globalStyles.subHeading,
                        { textAlign: 'center', marginVertical: 10 },
                      ]}
                    >
                      {t('we_sent_an_email_to')} {encryptEmail(email)}{' '}
                      {t('with_a_link_to_get_back_to_your_account')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
              <View style={styles.btnbox}>
                <PrimaryButton
                  onPress={() => {
                    setmodal(false);
                    navigation.navigate('MyProfile');
                  }}
                  text={t('ok')}
                ></PrimaryButton>
              </View>
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  view: {
    padding: 20,
    marginTop: 10,
  },
  image: {
    width: 60,
    height: 60,
    marginVertical: 30,
  },
  image2: {
    width: 40,
    height: 40,
    marginBottom: 30,
  },

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

ResetPassword.propTypes = {};

export default ResetPassword;
