import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Dimensions,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FastImage from '@changwoolab/react-native-fast-image';
import globalStyles from '../../utils/Helper/Style';
import StatusCard from '../StatusCard/StatusCard';

import GlobalText from '@components/GlobalText/GlobalText';

import moment from 'moment';
import {
  getDataFromStorage,
  translateDigits,
} from '../../utils/JsHelper/Helper';
import { getSyncTrackingOfflineCourse } from '../../utils/API/AuthService';

const CourseCard = ({
  onPress,
  style,
  cardWidth,
  index,
  item,
  appIcon,
  TrackData,
  navigation,
}) => {
  const { width } = Dimensions.get('window');

  const backgroundImages = [require('../../assets/images/png/Course.png')];

  const backgroundImage = backgroundImages[index % backgroundImages.length];

  // console.log('identifier', item?.identifier);
  // console.log('item', item?.leafNodes);

  //set progress and start date
  const [trackCompleted, setTrackCompleted] = useState(0);
  const [trackProgress, setTrackProgress] = useState(0);
  const [startedOn, setStartedOn] = useState('');

  useEffect(() => {
    fetchDataTrack();
  }, [item?.identifier]);

  const fetchDataTrack = async () => {
    try {
      if (TrackData) {
        for (let i = 0; i < TrackData.length; i++) {
          if (TrackData[i]?.courseId == item?.identifier) {
            let userId = await getDataFromStorage('userId');
            let offlineTrack = await getSyncTrackingOfflineCourse(
              userId,
              TrackData[i].courseId
            );
            let offline_in_progress = [];
            let offline_completed = [];
            let lastAccessOn = '';
            // console.log(
            //   '############ offlineTrack',
            //   JSON.stringify(offlineTrack)
            // );
            if (offlineTrack) {
              for (let jj = 0; jj < offlineTrack.length; jj++) {
                let offlineTrackItem = offlineTrack[jj];
                let content_id = offlineTrackItem?.content_id;
                lastAccessOn = offlineTrack[0]?.lastAccessOn;
                try {
                  let detailsObject = JSON.parse(
                    offlineTrackItem?.detailsObject
                  );
                  let status = 'no_started';
                  for (let k = 0; k < detailsObject.length; k++) {
                    let eid = detailsObject[k]?.eid;
                    if (eid == 'START' || eid == 'INTERACT') {
                      status = 'in_progress';
                    }
                    if (eid == 'END') {
                      status = 'completed';
                    }
                    // console.log(
                    //   '##### detailsObject length',
                    //   detailsObject[k]?.eid
                    // );
                  }
                  if (status == 'in_progress') {
                    offline_in_progress.push(content_id);
                  }
                  if (status == 'completed') {
                    offline_completed.push(content_id);
                  }
                } catch (e) {
                  console.log('e', e);
                }
              }
            }
            // console.log(
            //   '############ offline_in_progress',
            //   offline_in_progress
            // );
            // console.log('############ offline_completed', offline_completed);
            if (TrackData[i]?.started_on) {
              let temp_startedOn = TrackData[i].started_on;
              const formattedDate =
                moment(temp_startedOn).format('DD MMM YYYY');
              setStartedOn(formattedDate);
              // console.log('########### formattedDate', formattedDate);
            } else if (lastAccessOn !== '') {
              //get offlien time
              let temp_startedOn = lastAccessOn;
              const formattedDate =
                moment(temp_startedOn).format('DD MMM YYYY');
              setStartedOn(formattedDate);
              // console.log('########### formattedDate', formattedDate);
            }

            //merge offlien and online
            const mergedArray = [
              ...TrackData[i]?.completed_list,
              ...offline_completed,
            ];
            const uniqueArray = [...new Set(mergedArray)];
            let completed_list = uniqueArray;

            //merge offlien and online
            const mergedArray_progress = [
              ...TrackData[i]?.in_progress_list,
              ...offline_in_progress,
            ];
            const uniqueArray_progress = [...new Set(mergedArray_progress)];
            let in_progress_list = uniqueArray_progress;

            //get unique completed content list
            let completed = completed_list.length;
            let totalContent = 0;
            if (item?.leafNodes) {
              totalContent = item?.leafNodes.length;
            }
            let percentageCompleted = (completed / totalContent) * 100;
            percentageCompleted = Math.round(percentageCompleted);
            // console.log('########### completed', completed);
            // console.log('########### leafNodes', totalContent);
            // console.log('########### item?.leafNodes', item?.leafNodes);
            // console.log('########### percentageCompleted', percentageCompleted);
            setTrackCompleted(percentageCompleted);

            //get unique in progress content list
            let in_progress = in_progress_list.length;
            let percentageInProgress = (in_progress / totalContent) * 100;
            percentageInProgress = Math.round(percentageInProgress);
            setTrackProgress(percentageInProgress);
          }
        }
      }
    } catch (e) {
      console.log('error', e);
    }
  };

  // console.log(JSON.stringify(item));

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        style,
        { width: cardWidth, backgroundColor: 'transparent' },
      ]}
    >
      <View style={styles.cardBackground}>
        <FastImage
          style={styles.cardBackgroundImage}
          source={
            item?.posterImage
              ? {
                  uri: item?.posterImage,
                  priority: FastImage.priority.high,
                }
              : backgroundImage
          }
          resizeMode={FastImage.resizeMode.cover}
          priority={FastImage.priority.high}
        />
        <View style={styles.downloadView}>
          <StatusCard
            status={
              trackCompleted >= 100
                ? 'completed'
                : trackCompleted > 0
                  ? 'inprogress'
                  : trackProgress > 0
                    ? 'progress'
                    : 'not_started'
            }
            trackCompleted={trackCompleted}
            viewStyle={{
              borderTopLeftRadius: 10,
              borderTopRightRadius: 10,
            }}
          />
        </View>
      </View>
      <View style={styles.name}>
        <GlobalText
          style={[globalStyles.text, { width: '80%', fontWeight: 700 }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {item?.name}
        </GlobalText>
        <GlobalText
          style={[
            globalStyles.text,
            { width: '80%', marginVertical: 10, marginBottom: 20 },
          ]}
          numberOfLines={4}
          ellipsizeMode="tail"
        >
          {item?.description}
        </GlobalText>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    minHeight: 200,
    backgroundColor: '#e0e0e0',
    borderRadius: 15,
    alignItems: 'center',
    borderWidth: 1,
    margin: 10,
    borderColor: '#aaaaaa',
  },
  cardBackground: {
    width: '100%',
    height: 90,
    borderRadius: 8,
    // overflow: 'hidden',
  },
  cardBackgroundImage: {
    width: '100%',
    height: 90,
    borderRadius: 8,
  },

  cardTitle: {
    width: '80%',
    height: 60,
    position: 'absolute',
    zIndex: 1,
    top: 15,
    left: 0, // Adjust this to align with the card's left padding
    justifyContent: 'center', // Center text vertically
  },
  cardTitleImage: {
    width: '100%',
    height: '50%',
    position: 'absolute',
  },
  cardTitleText: {
    width: '50%',
    position: 'absolute',
    top: '30%', // Center vertically within the title image
    left: '10%', // Align with some margin from the left
    fontSize: 16,
    color: '#fff', // Assuming the text should be white on the image
    zIndex: 2, // Ensure the text is above the image
    textAlign: 'left', // Align text to the left
  },
  circleContainer: {
    width: 50, // Adjust size for the circle
    height: 50, // Adjust size for the circle
    borderRadius: 25, // Half of width/height to make it a circle
    overflow: 'hidden', // Ensure the image stays within the circular container
    borderWidth: 1,
    borderColor: '#ccc',
    alignSelf: 'flex-end',
    top: '-15%',
    right: 5,
  },
  view: {
    width: '100%',
    height: '50%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  grassImage: {
    width: '100%',
    height: 60,
    alignSelf: 'flex-end',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  name: {
    width: '100%',
    // borderWidth: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingLeft: 10,
    top: 15,
  },
  downloadView: {
    // top: 0,
    bottom: 90,
  },
  img: {
    width: 30,
    height: 30,
    top: 5,
  },
});

CourseCard.propTypes = {
  onPress: PropTypes.func,
  style: PropTypes.object,
  setCardWidth: PropTypes.any,
  index: PropTypes.any,
  item: PropTypes.any,
  appIcon: PropTypes.any,
};

export default CourseCard;
