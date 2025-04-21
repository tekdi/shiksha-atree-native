import React, { useCallback, useState, useEffect, useRef } from 'react';
import { CopilotStep, walkthroughable } from 'react-native-copilot';

import {
  BackHandler,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useNavigationState } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/AntDesign';

import { useTranslation } from '../../context/LanguageContext';
import wave from '../../assets/images/png/wave.png';
import CoursesBox from '../../components/CoursesBox/CoursesBox';
import SecondaryHeader from '../../components/Layout/SecondaryHeader';
import ContinueLearning from '../../components/ContinueLearning/ContinueLearning';
import { courseListApi_New } from '../../utils/API/AuthService';
import SyncCard from '../../components/SyncComponent/SyncCard';
import BackButtonHandler from '../../components/BackNavigation/BackButtonHandler';
import FilterModal from '@components/FilterModal/FilterModal';
import FilterList from '@components/FilterModal/FilterList';
import FilterDrawer from '@components/FilterModal/FilterDrawer';
import {
  capitalizeName,
  getDataFromStorage,
  logEventFunction,
} from '../../utils/JsHelper/Helper';
import { courseTrackingStatus } from '../../utils/API/ApiCalls';
import ActiveLoading from '../LoadingScreen/ActiveLoading';
import CustomSearchBox from '../../components/CustomSearchBox/CustomSearchBox';
import globalStyles from '../../utils/Helper/Style';

import GlobalText from '@components/GlobalText/GlobalText';
import AppUpdatePopup from '../../components/AppUpdate/AppUpdatePopup';
import PrimaryButton from '../../components/PrimaryButton/PrimaryButton';
import {
  restoreScrollPosition,
  storeScrollPosition,
} from '../../utils/Helper/JSHelper';

const CopilotView = walkthroughable(View); // Wrap Text to make it interactable

const ExploreTab = () => {
  // const navigation = useNavigation();
  const { t } = useTranslation();
  const [courseData, setCourseData] = useState([]);
  const [trackData, setTrackData] = useState([]);
  const [userInfo, setUserInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const [showExitModal, setShowExitModal] = useState(false);
  const [isModal, setIsModal] = useState(false);
  const [youthnet, setYouthnet] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [userId, setUserId] = useState('');
  const [parentFormData, setParentFormData] = useState([]);
  const [parentStaticFormData, setParentStaticFormData] = useState([]);
  const [orginalFormData, setOrginalFormData] = useState([]);
  const [instant, setInstant] = useState([]);
  const [offset, setOffset] = useState(0);
  const [count, setCount] = useState(0);
  const scrollViewRef = useRef(null);
  // const [scrollPosition, setScrollPosition] = useState(0);
  const [restoreScroll, setRestoreScroll] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Function to store the scroll position

  // Save scroll position when user scrolls
  const handleScroll = (event) => {
    const position = event.nativeEvent.contentOffset.y;
    const page = 'ExploreCourses';
    storeScrollPosition(position, page);
  };

  // Restore scroll position only when coming back
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      if (restoreScroll) {
        const page = 'ExploreCourses';
        restoreScrollPosition(scrollViewRef, page);
      }

      setRestoreScroll(true);
      setLoading(false);
    }, [restoreScroll])
  );

  const routeName = useNavigationState((state) => {
    const route = state.routes[state.index];
    return route.name;
  });

  useEffect(() => {
    const fetch = async () => {
      // const cohort_id = await getDataFromStorage('cohortId');
      let userType = await getDataFromStorage('userType');

      let isYouthnet = userType == 'youthnet' ? true : false;
      setYouthnet(isYouthnet);
      let userId = await getDataFromStorage('userId');
      setUserId(userId);
      const instant = {
        frameworkId: 'pos-framework',
        channelId: 'pos-channel',
      };
      setInstant(instant);
    };
    fetch();
  }, []);

  useEffect(() => {
    const logEvent = async () => {
      const obj = {
        eventName: 'course_page_view',
        method: 'on-view',
        screenName: 'ExploreCourses',
      };

      await logEventFunction(obj);
    };
    logEvent();
  }, [userInfo]);

  const handleExitApp = () => {
    setShowExitModal(false);
    BackHandler.exitApp(); // Exit the app
  };

  const handleCancel = () => {
    setShowExitModal(false); // Close the modal
  };

  const fetchData = async (offset, append = false) => {
    setLoading(true);

    const mergedFilter = { ...parentFormData, ...parentStaticFormData };
    let userType = await getDataFromStorage('userType');

    const instant = { frameworkId: 'pos-framework', channelId: 'pos-channel' };

    let data = await courseListApi_New({
      searchText,
      mergedFilter,
      instant,
      offset,
    });

    try {
      const contentList = data?.content || [];
      let courseList = contentList.map((item) => item?.identifier);

      let userId = await getDataFromStorage('userId');
      let course_track_data = await courseTrackingStatus(userId, courseList);

      let courseTrackData = [];
      if (course_track_data?.data) {
        courseTrackData =
          course_track_data?.data.find((course) => course.userId === userId)
            ?.course || [];
      }
      setTrackData(courseTrackData);
    } catch (e) {
      console.log('Error:', e);
    }

    const result = JSON.parse(await getDataFromStorage('profileData'));
    setUserInfo(result?.getUserDetails);
    setCount(data?.count);
    // Append new data only if handleViewMore is triggered
    setCourseData((prevData) =>
      append ? [...prevData, ...(data?.content || [])] : data?.content || []
    );

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [parentFormData, parentStaticFormData]);

  const handleSearch = async () => {
    setOffset(0); // Reset offset when searching
    await fetchData(0, false); // Reset course data
  };

  const handleViewMore = () => {
    const newOffset = offset + 5; // Increase offset by 5
    setOffset(newOffset); // Update state
    fetchData(newOffset, true); // Append new data
    const page = 'ExploreCourses';
    restoreScrollPosition(scrollViewRef, page);
  };

  // Refresh the component.
  const handleRefresh = async () => {
    setLoading(true); // Start Refresh Indicator

    try {
      console.log('Fetching Data...');
      fetchData(0, false); // Reset course data
    } catch (error) {
      console.log('Error fetching data:', error);
    } finally {
      setLoading(false); // Stop Refresh Indicator
    }
  };
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <SecondaryHeader logo />
      <AppUpdatePopup />
      <ScrollView
        nestedScrollEnabled
        ref={scrollViewRef}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={handleRefresh} />
        }
      >
        <View style={styles.view}>
          {loading ? (
            <ActiveLoading />
          ) : (
            <>
              <View style={styles.view2}>
                <GlobalText style={globalStyles.heading}>
                  {t('explore')}
                </GlobalText>
              </View>
              <GlobalText style={[globalStyles.text, { marginBottom: 15 }]}>
                {t('explore_additional_resources_and_nearby_skilling_centers')}
              </GlobalText>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <CopilotStep
                  text="You can search courses from here"
                  order={6}
                  name="start"
                >
                  <CopilotView style={{ width: '70%' }}>
                    <View>
                      <CustomSearchBox
                        setSearchText={setSearchText}
                        searchText={searchText}
                        handleSearch={handleSearch}
                        placeholder={t('Search Courses')}
                      />
                    </View>
                  </CopilotView>
                </CopilotStep>

                <TouchableOpacity
                  style={[
                    globalStyles.flexrow,
                    {
                      borderWidth: 1,
                      padding: 10,
                      borderRadius: 10,
                      width: 100,
                      justifyContent: 'space-evenly',
                      borderColor: '#DADADA',
                    },
                  ]}
                  onPress={() => {
                    setIsDrawerOpen(true);
                  }}
                >
                  <GlobalText style={globalStyles.text}>
                    {t('filter')}
                  </GlobalText>
                  <Icon
                    name={'caretdown'}
                    size={10}
                    color="#000"
                    // style={{ marginLeft: 10 }}
                  />
                </TouchableOpacity>
              </View>

              <SyncCard doneSync={fetchData} />
              <CopilotStep
                text="You can explore courses from here!"
                order={7}
                name="end"
              >
                <CopilotView style={{ width: '100%' }}>
                  <View>
                    {courseData.length > 0 ? (
                      <CoursesBox
                        // title={'Continue_Learning'}
                        // description={'Food_Production'}
                        style={{ titlecolor: '#06A816' }}
                        // viewAllLink={() =>
                        //   navigation.navigate('ViewAll', {
                        //     title: 'Continue_Learning',
                        //     data: data,
                        //   }
                        // )
                        // }
                        ContentData={courseData}
                        TrackData={trackData}
                        isHorizontal={false}
                      />
                    ) : (
                      <GlobalText style={globalStyles.heading2}>
                        {t('no_data_found')}
                      </GlobalText>
                    )}
                  </View>
                </CopilotView>
              </CopilotStep>
              {courseData.length !== count && (
                <View>
                  <PrimaryButton
                    onPress={handleViewMore}
                    text={t('viewmore')}
                  />
                </View>
              )}
            </>
          )}
          {showExitModal && (
            <BackButtonHandler
              exitRoute={true} // You can pass any props needed by the modal here
              onCancel={handleCancel}
              onExit={handleExitApp}
            />
          )}
        </View>
      </ScrollView>
      {/* {isModal && (
        <FilterModal
          isModal={isModal}
          setIsModal={setIsModal}
          setParentFormData={setParentFormData}
          setParentStaticFormData={setParentStaticFormData}
          parentFormData={parentFormData}
          parentStaticFormData={parentStaticFormData}
          setOrginalFormData={setOrginalFormData}
          orginalFormData={orginalFormData}
          instant={instant}
        />
      )} */}

      {isDrawerOpen && (
        <FilterDrawer
          isVisible={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        >
          <FilterList
            isModal={isModal}
            setIsModal={setIsModal}
            setParentFormData={setParentFormData}
            setParentStaticFormData={setParentStaticFormData}
            parentFormData={parentFormData}
            parentStaticFormData={parentStaticFormData}
            setOrginalFormData={setOrginalFormData}
            orginalFormData={orginalFormData}
            instant={instant}
            setIsDrawerOpen={setIsDrawerOpen}
          />
          <TouchableOpacity
            onPress={() => setIsDrawerOpen(false)}
          ></TouchableOpacity>
        </FilterDrawer>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  view: {
    width: '100%',
    //backgroundColor: 'white',
    padding: 15,
    // borderWidth: 1,
  },
  view2: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  image: {
    height: 30,
    width: 20,
  },
  text: { fontSize: 26, color: 'black', fontWeight: '500' },
  text2: {
    fontSize: 14,
    color: 'black',
    marginLeft: 10,
    fontWeight: '500',
  },
});

export default ExploreTab;
