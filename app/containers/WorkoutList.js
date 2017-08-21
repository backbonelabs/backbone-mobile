import React, { Component, PropTypes } from 'react';
import {
  Alert,
  View,
  ListView,
  Animated,
  TouchableOpacity,
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
import Input from '../components/Input';
import BodyText from '../components/BodyText';
import routes from '../routes';

class WorkoutList extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    workouts: PropTypes.array,
    isFetchingWorkouts: PropTypes.bool,
    user: PropTypes.shape({
      _id: PropTypes.string,
      favoriteWorkouts: PropTypes.array,
    }),
    navigator: PropTypes.shape({
      getCurrentRoutes: PropTypes.func,
    }),
  }

  constructor(props) {
    super(props);
    autobind(this);
    this.isiOS = Platform.OS === 'ios';
    this.subViewInitialPosition = Dimensions.get('window').height;
    this.sortCategories = [
      'ALPHABETICAL ORDER (A-Z)',
      'DIFFICULTY',
      'FAVORITES',
      // 'POPULARITY', // removed until backend is implemented
    ];
    // Template for categorizing all workouts into their type
    const routeStack = props.navigator.getCurrentRoutes();
    this.currentRoute = routeStack[routeStack.length - 1];

    this.workoutCategories = [
      { title: 'POSTURE', type: 1, workouts: [] },
      { title: 'EXERCISES', type: 2, workouts: [] },
      { title: 'STRETCHES', type: 3, workouts: [] },
      { title: 'MOBILITY', type: 4, workouts: [] },
    ];
    this.state = {
      workouts: this.organizeWorkouts(props.workouts),
      // This is the initial position of the subview
      bounceValue: new Animated.Value(this.subViewInitialPosition),
      subViewIsHidden: true,
      searchBarIsHidden: true,
      searchText: '',
      sortListBy: 0, // 0 is alpha, , 1 is difficulty, 2 is favorites, 3 is popularity
      isLoading: true,
    };
  }

  componentDidMount() {
    InteractionManager.runAfterInteractions(() => {
      this.props.dispatch(userActions.fetchUserWorkouts());
      this.setState({ isLoading: false });
    });
  }

  componentWillReceiveProps(nextProps) {
    // categorizes the workouts by type
    if (!isEqual(this.props.workouts, nextProps.workouts)) {
      this.setState({ workouts: this.organizeWorkouts(nextProps.workouts) });
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
   * Returns TabBar component
   * @return {<TabBar />}
   */
  getTabBar() {
    return (<TabBar toggleSubview={this.toggleSubview} />);
  }

  /**
   * Organizes the workouts by type:
   * Posture: 1,
   * Exercise: 2,
   * Stretches: 3,
   * Mobility: 4,
   * @param {Array} workoutsProps
   */
  organizeWorkouts(propsWorkouts) {
    const workouts = this.workoutCategories.slice();
    propsWorkouts.forEach((workout) => {
      if (workout.type === workouts[0].type) {
        workouts[0].workouts.push(workout);
      } else if (workout.type === workouts[1].type) {
        workouts[1].workouts.push(workout);
      } else if (workout.type === workouts[2].type) {
        workouts[2].workouts.push(workout);
      } else if (workout.type === workouts[3].type) {
        workouts[3].workouts.push(workout);
      }
    });
    return workouts;
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
    } else if (this.state.sortListBy === 2) {
      // Filter by favorites
      const favoriteWorkoutsHash = {};
      this.props.user.favoriteWorkouts.forEach(workout => {
        favoriteWorkoutsHash[workout] = workout;
      });
      itemMap.Favorites = newData.workouts.filter(workout => favoriteWorkoutsHash[workout._id]);
    } else if (this.state.sortListBy === 3) {
      // Sort by most popular
      itemMap['Most Popular'] = newData.workouts.sort((a, b) => b.popularity - a.popularity);
    }
    return itemMap;
  }

  /**
   * Toggles the appearance of the search bar only for iOS
   * Android will have a permanently showing search bar
   */
  toggleSearchBar() {
    this.setState({ searchBarIsHidden: true, searchText: '' });
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
   * Updates state from user search input
   * @param {String} text
   */
  handleSearchInput(text) {
    this.setState({ searchText: text });
  }

  /**
   * Handles row press to go to next screen
   * @param {Object} workout
   */
  handleRowPress(workout) {
    if (this.currentRoute.name === routes.freeTraining.name) {
      // Place holder for route to free training
      Alert.alert('workout', workout.title);
    } else if (this.currentRoute.name === routes.education.name) {
      // Place holder for route to education video
      Alert.alert('workout', workout.title);
    }
  }
  /**
   * Handles user favorite workouts
   * @param {Object} workout
   */
  handleHeartPress(workout) {
    const { _id: userId, favoriteWorkouts } = this.props.user;
    const { _id: workoutId } = workout;
    const newFavoriteWorkouts = favoriteWorkouts.slice();
    const workoutIdIndex = newFavoriteWorkouts.indexOf(workoutId);
    if (workoutIdIndex > -1) {
      newFavoriteWorkouts.splice(workoutIdIndex, 1);
    } else {
      newFavoriteWorkouts.push(workoutId);
    }
    this.props.dispatch(userActions.updateUser({
      _id: userId,
      favoriteWorkouts: newFavoriteWorkouts,
    }));
  }

  /**
   * Renders the rows for the list view
   * @param {Object} rowData
   */
  renderRow(rowData) {
    const { favoriteWorkouts } = this.props.user;
    const { _id: workoutId, title: workoutTitle } = rowData;

    let iconName = '';
    if (favoriteWorkouts.includes(workoutId)) {
      iconName = 'heart';
    } else {
      iconName = 'heart-o';
    }
    return (
      <View style={styles.rowContainer}>
        <TouchableOpacity onPress={() => { this.handleRowPress(rowData); }} >
          <View style={styles.rowInnerContainer}>
            <View style={styles.workoutPreviewBox} />
            <SecondaryText style={styles._rowText}>{workoutTitle}</SecondaryText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { this.handleHeartPress(rowData); }} >
          <Icon name={iconName} style={styles._heartIcon} size={styles.$heartIconSize} />
        </TouchableOpacity>
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
        <BodyText style={styles._sectionText}>{category}</BodyText>
      </View>
    );
  }

  /**
   * Renders list view item seperator
   * @param {Int} sectionID
   * @param {Int} rowID
   */
  renderSeparator(sectionId, rowId) {
    return (
      <View style={styles.bar} key={sectionId + rowId} />
    );
  }

  render() {
    const listViews = this.state.workouts.map((workoutList) =>
    (<View
      style={styles.listContainer}
      tabLabel={workoutList.title}
      key={workoutList.title}
    >
      { this.state.searchBarIsHidden && this.isiOS ? null :
        <Input
          style={styles._searchBar}
          value={this.state.searchText}
          returnKeyType="search"
          returnKeyLabel="search"
          placeholder="Search"
          autoCorrect={false}
          autoCapitalize="none"
          onChangeText={this.handleSearchInput}
          iconFont="FontAwesome"
          iconLeftName="search"
        />
    }
      <ListView
        dataSource={this.getDataSource(workoutList)}
        stickySectionHeadersEnabled
        stickyHeaderIndices={[0]}
        overScrollMode={'always'}
        renderRow={this.renderRow}
        renderSeparator={this.renderSeparator}
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
        <BodyText style={styles._subViewSortButtonText}>{label}</BodyText>
      </TouchableOpacity>
    ));

    if (this.props.isFetchingWorkouts || this.state.isLoading) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <ScrollableTabView
          style={styles.scrollableTabViewContainer}
          renderTabBar={this.getTabBar}
          onChangeTab={this.toggleSearchBar}
          tabBarPosition="top"
          tabBarActiveTextColor="#2196F3"
          tabBarInactiveTextColor="#bdbdbd"
          tabBarUnderlineStyle={styles.tabBarUnderlineStyle}
          tabBarTextStyle={styles._tabBarTextStyle}
        >
          {listViews}
        </ScrollableTabView>
        <Animated.View
          style={[styles.subView,
              { transform: [{ translateY: this.state.bounceValue }] }]}
        >
          <View style={styles.subViewButtonContainer}>
            <BodyText style={styles._subViewHeaderText}>SORT BY:</BodyText>
            {sortViews}
          </View>
          <TouchableOpacity
            onPress={this.toggleSubview}
            style={styles.subViewCancelButton}
          >
            <BodyText style={styles._subViewCancel}>CANCEL</BodyText>
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

export default connect(mapStateToProps)(WorkoutList);
