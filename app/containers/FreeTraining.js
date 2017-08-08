import React, { Component, PropTypes } from 'react';
import {
  Text,
  View,
  ListView,
  Animated,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import autobind from 'class-autobind';
import { connect } from 'react-redux';
import Icon from 'react-native-vector-icons/FontAwesome';
import styles from '../styles/freeTraining';
import SecondaryText from '../components/SecondaryText';
import FreeTrainingTabBar from './FreeTrainingTabBar';
import userActions from '../actions/user';
import Spinner from '../components/Spinner';

class FreeTraining extends Component {
  static propTypes = {
    dispatch: PropTypes.func,
    workouts: PropTypes.array,
    isFetchingWorkouts: PropTypes.bool,
  }

  constructor() {
    super();
    autobind(this);
    this.state = {
      workouts: [
        { title: 'EXERCISES', type: 1, workouts: [] },
        { title: 'STRETCHES', type: 2, workouts: [] },
        { title: 'POSTURE', type: 3, workouts: [] },
      ],
      bounceValue: new Animated.Value(600),  // This is the initial position of the subview
      subViewIsHidden: true,
      searchBarIsHidden: true,
      searchText: '',
      sortListBy: 0, // 0 is alpha, 1 is popularity, 2 is difficulty
      userFavorites: [], // temporary until mongo db connection is established
    };

    this.sortCategories = [
      'ALPHABETICAL ORDER (A-Z)',
      'POPULARITY',
      'DIFFICULTY'];
  }

  componentDidMount() {
    this.props.dispatch(userActions.fetchUserWorkouts());
  }

  componentWillReceiveProps(nextProps) {
    // catagorizes the workouts by type
    const workouts = this.state.workouts;
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

  getDataSource(dbSource) {
    const dataSource = new ListView.DataSource({
      rowHasChanged: (r1, r2) => r1 !== r2,
      sectionHeaderHasChanged: (s1, s2) => s1 !== s2,
    });
    return dataSource.cloneWithRowsAndSections(this.convertDataToMap(dbSource));
  }

  convertDataToMap(data) {
    const itemMap = [];
    // Filters the workouts that only matches the text from search bar
    const searchedWorkouts = data.workouts.filter((workout) => {
      const searchRegex = new RegExp(this.state.searchText, 'g');
      return searchRegex.test(workout.title);
    });
    const newData = Object.assign({}, data, { workouts: searchedWorkouts });

    if (this.state.sortListBy === 0) {
      // Sort by alphabetical order
      newData.workouts.sort((a, b) => b.title - a.title).forEach((item) => {
        if (!itemMap[item.title[0]]) {
          itemMap[item.title[0]] = [];
        }
        itemMap[item.title[0]].push(item);
      });
    } else if (this.state.sortListBy === 1) {
      // Sort by most popular
      itemMap['Most Popular'] = newData.workouts.sort((a, b) => b.popularity - a.popularity);
    } else if (this.state.sortListBy === 2) {
      // Sort by difficulty
      newData.workouts.sort((a, b) => a.difficulty - b.difficulty).forEach((item) => {
        let difficultyLabel = '';
        switch (item.difficulty) {
          case 1:
            difficultyLabel = 'Beginner';
            break;
          case 2:
            difficultyLabel = 'Intermediate';
            break;
          case 3:
            difficultyLabel = 'Advance';
            break;
          default:
            difficultyLabel = 'Pro';
        }
        if (!itemMap[difficultyLabel]) {
          itemMap[difficultyLabel] = [];
        }
        itemMap[difficultyLabel].push(item);
      });
    }
    return itemMap;
  }

  toggleSearchBar() {
    this.setState({ searchBarIsHidden: true, searchText: '' });
  }

  toggleSubview() {
    const { subViewIsHidden } = this.state;
    let toValue = 600;

    if (subViewIsHidden) {
      toValue = 0;
    }

    // This will animate the transalteY of the subview between 0 & 100
    // depending on its current state 100 comes from the style below,
    // which is the height of the subview.
    Animated.spring(
      this.state.bounceValue,
      {
        toValue,
        velocity: 3,
        tension: 2,
        friction: 8,
      }
    ).start();

    this.setState({ subViewIsHidden: !subViewIsHidden });
  }

  handleScroll(event) {
    if (event.nativeEvent.contentOffset.y < 0) {
      this.setState({ searchBarIsHidden: false });
    }
  }

  renderRow(rowData) {
    const newUserFavorites = this.state.userFavorites;
    let iconName = '';
    if (newUserFavorites.includes(rowData._id)) {
      iconName = 'heart';
    } else {
      iconName = 'heart-o';
    }
    return (
      <View style={{ flexDirection: 'column' }}>
        <View style={styles.listContainer}>
          <View style={styles.listInnerContainer}>
            <View style={styles.preview} />
            <SecondaryText style={styles._listText}>{rowData.title}</SecondaryText>
          </View>
          <TouchableOpacity
            onPress={() => {
              if (!newUserFavorites.includes(rowData._id)) {
                newUserFavorites.push(rowData._id);
                this.setState({ userFavorites: newUserFavorites });
                this.setState({ heartIcon: 'heart' });
              } else {
                const idIndex = newUserFavorites.indexOf(rowData._id);
                this.state.userFavorites.splice(idIndex, 1);
                this.setState({ heartIcon: 'heart-o' });
              }
            }}
          >
            <Icon name={iconName} style={styles._icon} size={25} />
          </TouchableOpacity>
        </View>
        <View style={styles.barContainer}>
          <View style={styles.bar} />
        </View>
      </View>
    );
  }

  renderSectionHeader(sectionData, category) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionText}>{category}</Text>
      </View>
    );
  }

  render() {
    const listViews = this.state.workouts.map((workoutList) =>
    (<View
      tabLabel={workoutList.title}
      key={workoutList.title}
    >
      { this.state.searchBarIsHidden ? null :
        <View style={styles.searchBarContainer}>
          <View style={styles.searchBarIconContainer}>
            <Icon name="search" style={styles.searhBarIcon} color="#BDBDBD" size={15} />
          </View>
          <TextInput
            style={styles.searchBarTextInput}
            placeholder="Search"
            autoCorrect={false}
            autoCapitalize="none"
            onChangeText={(text) => { this.setState({ searchText: text }); }}
          />
        </View>}
      <ListView
        dataSource={this.getDataSource(workoutList)}
        renderRow={this.renderRow}
        onPressRow={() => {}}
        renderSectionHeader={this.renderSectionHeader}
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

    if (this.props.isFetchingWorkouts) {
      return <Spinner />;
    }

    return (
      <View style={styles.container}>
        <ScrollableTabView
          style={styles.scrollableTabViewContainer}
          renderTabBar={() =>
            <FreeTrainingTabBar
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

const mapStateToProps = (state) => ({
  workouts: state.user.workouts,
  isFetchingWorkouts: state.user.isFetchingWorkouts,
});

export default connect(mapStateToProps)(FreeTraining);
