import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  ListView,
  Animated,
  TouchableOpacity,
  TextInput,
  InteractionManager,
  Platform,
  Dimensions,
} from 'react-native';
import isEqual from 'lodash/isEqual';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import TabBar from '../components/TabBar';
import userActions from '../actions/user';
import Spinner from '../components/Spinner';


class FreeTraining extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    workouts: PropTypes.array,
    isFetchingWorkouts: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      favoriteWorkouts: PropTypes.array,
    }),
  }

  constructor() {
    super();
    autobind(this);
    this.isiOS = Platform.OS === 'ios';
    this.subViewInitialPosition = Dimensions.get('window').height;
    this.sortCategories = [
      'ALPHABETICAL ORDER (A-Z)',
      'POPULARITY',
      'DIFFICULTY'];
    // Template for categorizing all workouts into their type
    this.workoutCategories = [
        { title: 'POSTURE', type: 1, workouts: [] },
        { title: 'EXERCISES', type: 2, workouts: [] },
        { title: 'STRETCHES', type: 3, workouts: [] },
        { title: 'MOBILITY', type: 4, workouts: [] },
    ];
    this.state = {
      workouts: [],
      // This is the initial position of the subview
      bounceValue: new Animated.Value(this.subViewInitialPosition),
      subViewIsHidden: true,
      searchBarIsHidden: true,
      searchText: '',
      sortListBy: 0, // 0 is alpha, 1 is popularity, 2 is difficulty
      isLoading: true,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserWorkouts());
      this.props.dispatch(userActions.fetchUser());
      this.setState({ isLoading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    // categorizes the workouts by type
    if (!isEqual(this.props.workouts, nextProps.workouts)
      || this.state.workouts.length === 0) {
      const workouts = this.workoutCategories.slice();
      nextProps.workouts.forEach((workout) => {
        if (workout.type === workouts[0].type) {
          workouts[0].workouts.push(workout);
        } else if (workout.type === workouts[1].type) {
          workouts[1].workouts.push(workout);
        } else if (workout.type === workouts[2].type) {
          workouts[2].workouts.push(workout);
        }
      });

      this.setState({ workouts });
    }
  }

  /**
   * Creates a new ListView object
   * @param {Object[]} dbSource
   * @return {ListView.DataSource} new ListView object
   */
  getDataSource(dbSource) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return dataSource.cloneWithRowsAndSections(this.convertDataToMap(dbSource));
  }

  /**
   * Filters and sorts workouts for the list view
   * @param {Object[]} workouts data
   * @return {Array} An array of sorted workouts objects
   */
  convertDataToMap(data) {
    const itemMap = {};
    // Filters the workouts that only matches the text from search bar
    const searchedWorkouts = data.workouts.filter((workout) => {
      const searchRegex = new RegExp(this.state.searchText, 'i');
      return searchRegex.test(workout.title);
    });
    const newData = Object.assign({}, data, { workouts: searchedWorkouts });

    if (this.state.sortListBy === 0) {
      // Sort by alphabetical order
      newData.workouts.sort((a, b) => {
        if (b.title > a.title) return -1;
        if (b.title < a.title) return 1;
        return 0;
      }).forEach((workout) => {
        const charIndex = (workout.title[0]).toUpperCase();
        if (!itemMap[charIndex]) {
          itemMap[charIndex] = [];
        }
        itemMap[charIndex].push(workout);
      });
    } else if (this.state.sortListBy === 1) {
      // Sort by most popular
      itemMap['Most Popular'] = newData.workouts.sort((a, b) => b.popularity - a.popularity);
    } else if (this.state.sortListBy === 2) {
      // Sort by difficulty
      newData.workouts.sort((a, b) => a.difficulty - b.difficulty).forEach((workout) => {
        let difficultyLabel = '';
        switch (workout.difficulty) {
          case 1:
            difficultyLabel = 'Beginner';
            break;
          case 2:
            difficultyLabel = 'Intermediate';
            break;
          case 3:
            difficultyLabel = 'Advanced';
            break;
          default:
            difficultyLabel = 'Pro';
        }
        if (!itemMap[difficultyLabel]) {
          itemMap[difficultyLabel] = [];
        }
        itemMap[difficultyLabel].push(workout);
      });
    }
    return itemMap;
  }

  /**
   * Toggles the appearance of the search bar only for iOS
   * Android will have a permanently showing search bar
   */
  toggleSearchBar() {
    if (this.isiOS) {
      this.setState({ searchBarIsHidden: true });
    }
    this.setState({ searchText: '' });
  }

  /**
   * Toggles the subView menu for sorting
   */
  toggleSubview() {
    const { subViewIsHidden } = this.state;
    let toValue = this.subViewInitialPosition;

    if (subViewIsHidden) {
      toValue = 0;
    }

    Animated.spring(
      this.state.bounceValue,
      {
        toValue,
        tension: 20,
        friction: 8,
      }
    ).start();

    this.setState(prevState => ({ subViewIsHidden: !prevState.subViewIsHidden }));
  }

  /**
   * Detects when the listView scrolls beyond the top so
   * the search bar will appear
   * @param {Object} event
   */
  handleScroll(event) {
    if (event.nativeEvent.contentOffset.y < 0) {
      this.setState({ searchBarIsHidden: false });
    } else if (event.nativeEvent.contentOffset.y > 100
      && !this.state.searchBarIsHidden
      && this.state.searchText === '') {
      this.setState({ searchBarIsHidden: true });
    }
  }

  /**
   * Renders the rows for the list view
   * @param {Object} rowData
   */
  renderRow(rowData) {
    const { _id: userId, favoriteWorkouts } = this.props.user;
    const { _id: workoutId, title: workoutTitle } = rowData;

    let iconName = '';
    if (favoriteWorkouts.includes(workoutId)) {
      iconName = 'heart';
    } else {
      iconName = 'heart-o';
    }
    return (
      <View style={{ flexDirection: 'column' }} >
        <View style={styles.listContainer}>
          <View style={styles.listInnerContainer}>
            <View style={styles.workoutPreviewBox} />
            <SecondaryText style={styles._listText}>{workoutTitle}</SecondaryText>
          </View>
          <TouchableOpacity
            onPress={() => {
              const newFavoriteWorkouts = favoriteWorkouts.slice();
              if (!favoriteWorkouts.includes(workoutId)) {
                newFavoriteWorkouts.push(workoutId);
              } else {
                const idIndex = newFavoriteWorkouts.indexOf(workoutId);
                newFavoriteWorkouts.splice(idIndex, 1);
              }
              this.props.dispatch(userActions.updateUser({
                _id: userId,
                favoriteWorkouts: newFavoriteWorkouts,
              }));
            }}
          >
            <Icon name={iconName} style={styles._heartIcon} size={styles.$settingsIconSize} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  /**
   * Renders the header for each list view section
   * @param {Object} sectionData
   * @param {String} category
   */
  renderSectionHeader(sectionData, category) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{category}</Text>
      </View>
    );
  }

  /**
   * Renders list view item seperator
   * @param {Int} sectionID
   * @param {Int} rowID
   */
  renderSeparator(sectionID, rowID) {
    return (
      <View style={styles.barContainer} key={sectionID + rowID}>
        <View style={styles.bar} key={rowID} />
      </View>
    );
  }

  render() {
    const listViews = this.state.workouts.map((workoutList) =>
    (<View
      tabLabel={workoutList.title}
      key={workoutList.title}
    >
      { this.state.searchBarIsHidden && this.isiOS ? null :
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarIconContainer}>
            <Icon name="search" style={styles.searchBarIcon} color="#BDBDBD" size={15} />
          </View>
          <View>
            <TextInput
              style={[styles.searchBarTextInput]}
              underlineColorAndroid="#EEEEEE"
              returnKeyType="search"
              returnKeyLabel="search"
              placeholder="Search"
              autoCorrect={false}
              autoCapitalize="none"
              overScrollMode="always"
              onChangeText={(text) => { this.setState({ searchText: text }); }}
            />
          </View>
        </View>
    }
      <ListView
        dataSource={this.getDataSource(workoutList)}
        stickySectionHeadersEnabled
        stickyHeaderIndices={[0]}
        overScrollMode={'always'}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
        renderFooter={() =>
          (this.state.searchBarIsHidden && this.isiOS ?
          null : <View style={styles.footerSpaceBox} />)
        }
        onPressRow={() => {}}
        renderSectionHeader={this.renderSectionHeader}
        enableEmptySections
        onScroll={this.handleScroll}
      />
    </View>)
    );

    const sortViews = this.sortCategories.map((label, index) => (
      <TouchableOpacity
        key={label}
        style={styles.subViewSortButton}
        onPress={() => {
          this.setState({ sortListBy: index });
          this.toggleSubview();
        }}
      >
        <Text style={styles.subViewSortButtonText}>{label}</Text>
      </TouchableOpacity>
    ));

    if (this.props.isFetchingWorkouts || this.state.isLoading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <ScrollableTabView
          style={styles.scrollableTabViewContainer}
          renderTabBar={() =>
            <TabBar
              toggleSearchBar={this.toggleSearchBar}
              toggleSubview={this.toggleSubview}
            />}
          tabBarPosition="top"
          tabBarActiveTextColor="#2196F3"
          tabBarInactiveTextColor="#bdbdbd"
          tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
          tabBarTextStyle={styles.tabBarTextStyle}
        >
          {listViews}
        </ScrollableTabView>
        <Animated.View
          style={[styles.subView,
              { transform: [{ translateY: this.state.bounceValue }] }]}
        >
          <View style={styles.subViewButtonContainer}>
            <Text style={styles.subViewHeaderText}>CATEGORIZED LIST:</Text>
            {sortViews}
          </View>
          <TouchableOpacity
            onPress={() => { this.toggleSubview(); }}
            style={styles.subViewCancelButton}
          >
            <Text style={styles.subViewCancel}>CANCEL</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  const { workouts, isFetchingWorkouts, favoriteWorkouts, user } = state.user;
  return { workouts, isFetchingWorkouts, favoriteWorkouts, user };
};

export default connect(mapStateToProps)(FreeTraining);
