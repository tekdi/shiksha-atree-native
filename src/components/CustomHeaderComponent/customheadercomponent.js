import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from 'react-native';
import React from 'react';
import { useTranslation } from '../../context/LanguageContext';
import PropTypes from 'prop-types';
import FastImage from '@changwoolab/react-native-fast-image';
import backIcon from '../../assets/images/png/arrow-back-outline.png';

import GlobalText from '@components/GlobalText/GlobalText';

const HeaderComponent = ({ currentPage, questionIndex, totalForms }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.block}>
        {/* <Image style={styles.image} source={Logo} resizeMode="contain" /> */}
        <FastImage
          style={styles.image}
          source={require('../../assets/images/gif/pen_paper.gif')}
          resizeMode={FastImage.resizeMode.contain}
          priority={FastImage.priority.high} // Set the priority here
        />
        <View style={styles.textContainer}>
          <GlobalText style={styles.text1}>
            {questionIndex}/{totalForms}
          </GlobalText>
          <GlobalText style={styles.text2}>
            {currentPage === 1
              ? t('q1_name')
              : currentPage === 2
                ? t('q2_a_bit_more')
                : currentPage === 3
                  ? t('your_background_other_details')
                  : currentPage === 4
                    ? t('where_are_you_located')
                    : currentPage === 5
                      ? t('q6_login_cred')
                      : currentPage === 6
                        ? t('which_program_do_you_want_to_enroll_to')
                        : t('which_program_do_you_want_to_enroll_to')}
          </GlobalText>
        </View>
      </View>
    </SafeAreaView>
  );
};

HeaderComponent.propTypes = {
  // currentPage: PropTypes.number,
  questionIndex: PropTypes.number,
  totalForms: PropTypes.number,
};

const styles = StyleSheet.create({
  image: {
    marginRight: 20,
    height: 60,
    width: 60,
    // borderWidth: 1,
  },
  container: {
    backgroundColor: 'white',
    maxHeight: 90,
    flex: 1,
    // marginBottom: 15,
    // borderWidth: 1,
  },
  text1: {
    color: '#7C766F',
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    marginRight: 15,
  },
  text2: {
    fontFamily: 'Poppins-Medium',
    color: 'black',
    fontSize: 16,
    flexWrap: 'wrap',
  },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'column',
    // borderWidth: 1,
  },
});

export default HeaderComponent;
