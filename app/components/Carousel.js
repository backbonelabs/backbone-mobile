import React, { Component, PropTypes } from 'react';
import { ScrollView, Animated, Platform, Easing } from 'react-native';
import shallowCompare from 'react-addons-shallow-compare';

export default class Carousel extends Component {
  static propTypes = {
    ...ScrollView.propTypes,
    /**
     * Supply items to loop on
     */
    items: PropTypes.array.isRequired,
    /**
     * Width in pixels of your slider according
     * to your styles
     */
    sliderWidth: PropTypes.number,
    /**
     * Height in pixels of the carousel itself
     * Required with 'vertical' mode
     */
    sliderHeight: PropTypes.number,
    /**
     * Width in pixels of your elements
     */
    itemWidth: PropTypes.number,
    /**
     * Height in pixels of carousel's items
     * Required with 'vertical' mode
     */
    itemHeight: PropTypes.number,
    /**
     * Function returning a react element. The entry
     * data is the 1st parameter, its index is the 2nd
     */
    renderItem: PropTypes.func.isRequired,
    /**
     * Style of each item's container
     */
    slideStyle: Animated.View.propTypes.style,
    /**
     * whether to implement a `shouldComponentUpdate`
     * strategy to minimize updates
     */
    shouldOptimizeUpdates: PropTypes.bool,
    /**
    * Global wrapper's style
    */
    containerCustomStyle: Animated.View.propTypes.style,
    /**
    * Content container's style
    */
    contentContainerCustomStyle: Animated.View.propTypes.style,
    /**
     * Minimum threshold to be recognized as a swipe
     */
    swipeThreshold: PropTypes.number,
    /**
     * Animated animation to use. Provide the name
     * of the method, defaults to timing
     */
    animationFunc: PropTypes.string,
    /**
     * Animation options to be merged with the
     * default ones. Can be used w/ animationFunc
     */
    animationOptions: PropTypes.object,
    /**
     * Scale factor of the inactive slides
     */
    inactiveSlideScale: PropTypes.number,
    /**
     * Opacity value of the inactive slides
     */
    inactiveSlideOpacity: PropTypes.number,
    /**
     * Index of the first item to display
     */
    firstItem: PropTypes.number,
    /**
     * Trigger autoplay
     */
    autoplay: PropTypes.bool,
    /**
     * Delay until navigating to the next item
     */
    autoplayInterval: PropTypes.number,
    /**
     * Delay before enabling autoplay on startup and
     * after releasing the touch
     */
    autoplayDelay: PropTypes.number,
    /**
     * If enabled, releasing the touch will scroll
     * to the center of the nearest/active item
     */
    enableSnap: PropTypes.bool,
    /**
     * If enabled, snapping will be triggered once
     * the ScrollView stops moving, not when the
     * user releases his finger
    */
    enableMomentum: PropTypes.bool,
    /**
     * Snapping on android is kinda choppy, especially
     * when swiping quickly so you can disable it
     */
    snapOnAndroid: PropTypes.bool,
    /**
     * Fired when snapping to an item
     */
    onSnapToItem: PropTypes.func,
    /**
     * Fired when scrolling
     */
    onCarouselScroll: PropTypes.func,
    /**
     * Layout slides vertically
     */
    vertical: PropTypes.bool,
    /**
     * Reverse items rendering
     */
    reverse: PropTypes.bool,
  };

  static defaultProps = {
    shouldOptimizeUpdates: true,
    autoplay: false,
    autoplayInterval: 3000,
    autoplayDelay: 5000,
    firstItem: 0,
    enableSnap: true,
    enableMomentum: false,
    snapOnAndroid: false,
    swipeThreshold: 20,
    animationFunc: 'timing',
    animationOptions: {
      easing: Easing.elastic(1),
    },
    slideStyle: {},
    containerCustomStyle: null,
    contentContainerCustomStyle: null,
    inactiveSlideScale: 0.9,
    inactiveSlideOpacity: 1,
    vertical: false,
    reverse: false,
  }

  constructor(props) {
    super(props);
    this.state = {
      activeItem: props.firstItem,
    };
    this._positions = [];
    this._calcCardPositions(props);
    this._onTouchStart = this._onTouchStart.bind(this);
    this._onScroll = this._onScroll.bind(this);
    this._onScrollEnd = this._snapEnabled ? this._onScrollEnd.bind(this) : false;
    this._onScrollBegin = this._snapEnabled ? this._onScrollBegin.bind(this) : false;
    this._onScrollEndDrag = !props.enableMomentum || Platform.OS === 'android' ?
    this._onScrollEndDrag.bind(this) : false;
    this._onMomentumEnd = props.enableMomentum ? this._onMomentumEnd.bind(this) : false;
    this._initInterpolators = this._initInterpolators.bind(this);
    this._onTouchRelease = this._onTouchRelease.bind(this);
    // This bool aims at fixing an iOS bug due to scrolTo that triggers onMomentumScrollEnd.
    // onMomentumScrollEnd fires this._snapScroll, thus creating an infinite loop.
    this._ignoreNextMomentum = false;
  }

  componentDidMount() {
    const { firstItem, autoplay } = this.props;

    this._initInterpolators(this.props);
    setTimeout(() => {
      this.snapToItem(firstItem, false, false, true);
    }, 0);
    if (autoplay) {
      this.startAutoplay();
    }
  }

  componentWillReceiveProps(nextProps) {
    const { items, firstItem } = nextProps;

    if (items.length !== this.props.items.length) {
      this._positions = [];
      this._calcCardPositions(nextProps);
      this._initInterpolators(nextProps);
      this.setState({ activeItem: firstItem });
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.shouldOptimizeUpdates === false) {
      return true;
    }

    return shallowCompare(this, nextProps, nextState);
  }

  componentWillUnmount() {
    this.stopAutoplay();
  }

  get _snapEnabled() {
    const { enableSnap, snapOnAndroid } = this.props;

    return enableSnap && (Platform.OS === 'ios' || snapOnAndroid);
  }

  get _nextItem() {
    const { activeItem } = this.state;

    return this._positions[activeItem + 1] ? activeItem + 1 : 0;
  }

  _getScrollOffset(event) {
    const { vertical } = this.props;
    return (event && event.nativeEvent && event.nativeEvent.contentOffset &&
      event.nativeEvent.contentOffset[vertical ? 'y' : 'x']) || 0;
  }

  _calcCardPositions(props = this.props) {
    const { items, itemWidth, itemHeight, vertical } = props;
    const sizeRef = vertical ? itemHeight : itemWidth;

    items.forEach((item, index) => {
      this._positions[index] = {
        start: index * sizeRef,
      };
      this._positions[index].end = this._positions[index].start + sizeRef;
    });
  }

  _initInterpolators(props = this.props) {
    const { items, firstItem } = props;
    const interpolators = [];

    items.forEach((item, index) => {
      interpolators.push(new Animated.Value(index === firstItem ? 1 : 0));
    });
    this.setState({ interpolators });
  }

  _getActiveItem(center, offset = 0) {
    const itemsLength = this._positions.length;

    for (let i = 0; i < itemsLength; i++) {
      const { start, end } = this._positions[i];
      if (center + offset >= start && center - offset <= end) {
        return i;
      }
    }
    return 0;
  }

  _getCenter(offset) {
    const { sliderWidth, sliderHeight, itemWidth, itemHeight, vertical } = this.props;
    const containerMargin = (vertical ? (sliderHeight - itemHeight) / 2 :
      (sliderWidth - itemWidth) / 2);

    return (offset + ((vertical ? sliderHeight : sliderWidth) / 2)) - containerMargin;
  }

  _onScroll(event) {
    const { animationFunc, animationOptions, enableMomentum } = this.props;
    const { activeItem } = this.state;
    const newActiveItem = this._getActiveItem(this._getCenter(this._getScrollOffset(event)));

    if (enableMomentum) {
      clearTimeout(this._snapNoMomentumTimeout);
    }

    clearTimeout(this._scrollEndTimeout);

    if (activeItem !== newActiveItem) {
      if (this.state.interpolators[activeItem]) {
        Animated[animationFunc](
          this.state.interpolators[activeItem],
          { ...animationOptions, toValue: 0 }
        ).start();
      }
      this.setState({ activeItem: newActiveItem });
      if (this.state.interpolators[newActiveItem]) {
        Animated[animationFunc](
          this.state.interpolators[newActiveItem],
          { ...animationOptions, toValue: 1 }
        ).start();
      }
    }

    if (this.props.onCarouselScroll) {
      this.props.onCarouselScroll(event);
    }
  }

  _onTouchStart() {
    if (this._autoplaying) {
      this.stopAutoplay();
    }
  }

  _onScrollBegin(event) {
    this._scrollStart = this._getScrollOffset(event);
    this._scrollStartActive = this.state.activeItem;
    this._ignoreNextMomentum = false;
  }

  _onScrollEnd(offset) {
    const { autoplayDelay, autoplay } = this.props;

    if (this._ignoreNextMomentum) {
      // iOS fix
      this._ignoreNextMomentum = false;
      return;
    }

    const newActiveItem = this._getActiveItem(this._getCenter(offset));
    this.setState({ activeItem: newActiveItem });
    this._scrollEnd = offset;
    this._scrollEndActive = newActiveItem;

    const delta = this._scrollEnd - this._scrollStart;

    if (this._snapEnabled) {
      this._snapScroll(delta);
    }

    if (autoplay) {
      // Restart autoplay after a little while
      // This could be done when releasing touch
      // but the event is buggy on Android...
      clearTimeout(this._enableAutoplayTimeout);
      this._enableAutoplayTimeout =
        setTimeout(() => {
          this.startAutoplay(true);
        }, autoplayDelay + 1000);
    }
  }

  _onScrollEndDrag(event) {
    // Workaround for Android where no touch-end related events are fired
    // whenever momentum is enabled and the user drag slowly causing no generated momentum.
    // To prevent double handlers on such case, we have to check if we have to fire the
    // scrollEnd event or wait for the momentumEnd event.
    const offset = this._getScrollOffset(event);
    this._scrollEndTimeout = setTimeout(() => {
      this._onScrollEnd(offset);
    }, 50, offset, event);
  }

  _onMomentumEnd(event) {
    clearTimeout(this._scrollEndTimeout);
    this._onScrollEnd(this._getScrollOffset(event));
  }

  // Due to a bug, this event is only fired on iOS
  // https://github.com/facebook/react-native/issues/6791
  // it's fine since we're only fixing an iOS bug in it, so ...
  _onTouchRelease() {
    const { enableMomentum } = this.props;

    if (enableMomentum && Platform.OS === 'ios') {
      this._snapNoMomentumTimeout =
        setTimeout(() => {
          // this._snapScroll(0);
          this.snapToItem(this.state.activeItem);
        }, 100);
    }
  }

  _snapScroll(delta) {
    const { swipeThreshold } = this.props;

    // When using momentum and releasing the touch with
    // no velocity, scrollEndActive will be undefined (iOS)
    if (!this._scrollEndActive && this._scrollEndActive !== 0 && Platform.OS === 'ios') {
      this._scrollEndActive = this._scrollStartActive;
    }

    if (this._scrollStartActive !== this._scrollEndActive) {
      // Snap to the new active item
      this.snapToItem(this._scrollEndActive);
    } else if (delta > 0) {
      if (delta > swipeThreshold) {
        this.snapToItem(this._scrollStartActive + 1);
      } else {
        this.snapToItem(this._scrollEndActive);
      }
    } else if (delta < 0) {
      if (delta < -swipeThreshold) {
        this.snapToItem(this._scrollStartActive - 1);
      } else {
        this.snapToItem(this._scrollEndActive);
      }
    } else {
      // Snap to current
      this.snapToItem(this._scrollEndActive);
    }
  }

  get items() {
    const {
      items,
      renderItem,
      slideStyle,
      inactiveSlideScale,
      inactiveSlideOpacity,
      reverse,
    } = this.props;

    if (!this.state.interpolators || !this.state.interpolators.length) {
      return false;
    }

    const nodes = items.map((entry, index) => {
      const animatedValue = this.state.interpolators[index];
      const idx = (reverse ? items.length - index - 1 : index);
      return (
        <Animated.View
          key={`carousel-item-${idx}`}
          style={[
            slideStyle,
            {
              transform: [{
                scale: animatedValue.interpolate({
                  inputRange: [0, 1],
                  outputRange: [inactiveSlideScale, 1],
                }),
              }],
              opacity: animatedValue.interpolate({
                inputRange: [0, 1],
                outputRange: [inactiveSlideOpacity, 1],
              }),
            },
          ]}
        >
          { renderItem(entry, idx) }
        </Animated.View>
      );
    });

    return nodes;
  }

  get currentIndex() {
    return this.state.activeItem;
  }

  startAutoplay(instantly = false) {
    const { autoplayInterval, autoplayDelay } = this.props;

    if (this._autoplaying) {
      return;
    }

    setTimeout(() => {
      this._autoplaying = true;
      this._autoplayInterval =
        setInterval(() => {
          if (this._autoplaying) {
            this.snapToItem(this._nextItem);
          }
        }, autoplayInterval);
    }, instantly ? 0 : autoplayDelay);
  }

  stopAutoplay() {
    this._autoplaying = false;
    clearInterval(this._autoplayInterval);
  }

  snapToItem(idx, animated = true, callback = true, initial = false) {
    const { vertical, reverse } = this.props;
    let index = idx;
    let fireCallback = callback;
    const itemsLength = this._positions.length;

    if (!index) {
      index = 0;
    }

    if (index >= itemsLength) {
      index = itemsLength - 1;
      fireCallback = false;
    } else if (index < 0) {
      index = 0;
      fireCallback = false;
    }

    const snap = itemsLength && this._positions[index].start;

    // Make sure the component hasn't been unmounted
    if (this.scrollview) {
      this.scrollview.scrollTo({ x: (vertical ? 0 : snap), y: (vertical ? snap : 0), animated });
      if (this.props.onSnapToItem && fireCallback) {
        this.props.onSnapToItem((reverse ? itemsLength - index - 1 : index),
          this.props.items[index]);
      }

      // iOS fix, check the note in the constructor
      if (!initial && Platform.OS === 'ios') {
        this._ignoreNextMomentum = true;
      }
    }
  }

  snapToNext(animated = true) {
    const itemsLength = this._positions.length;

    let newIndex = this.currentIndex + 1;
    if (newIndex > itemsLength - 1) {
      newIndex = 0;
    }
    this.snapToItem(newIndex, animated);
  }

  snapToPrev(animated = true) {
    const itemsLength = this._positions.length;

    let newIndex = this.currentIndex - 1;
    if (newIndex < 0) {
      newIndex = itemsLength - 1;
    }
    this.snapToItem(newIndex, animated);
  }

  render() {
    const {
      sliderWidth,
      sliderHeight,
      itemWidth,
      itemHeight,
      containerCustomStyle,
      contentContainerCustomStyle,
      enableMomentum,
      vertical,
    } = this.props;

    const horizontalMargin = (sliderWidth - itemWidth) / 2;
    const verticalMargin = (sliderHeight - itemHeight) / 2;
    let style;
    let contentContainerStyle;

    if (!vertical) {
      style = [
        {
          paddingHorizontal: Platform.OS === 'ios' ? horizontalMargin : 0,
          flexDirection: 'row',
          width: sliderWidth,
        },
        containerCustomStyle || {},
      ];
      contentContainerStyle = [
        {
          paddingLeft: Platform.OS === 'android' ? horizontalMargin : 0,
          paddingRight: horizontalMargin,
        },
        contentContainerCustomStyle || {},
      ];
    } else {
      style = [
        {
          flexDirection: 'column',
          height: sliderHeight,
        },
        containerCustomStyle || {},
      ];
      contentContainerStyle = [
        {
          paddingTop: Platform.OS === 'android' ? verticalMargin : 0,
          paddingBottom: verticalMargin,
        },
        contentContainerCustomStyle || {},
      ];
    }

    return (
      <ScrollView
        decelerationRate={0.9}
        style={style}
        horizontal={!vertical}
        contentContainerStyle={contentContainerStyle}
        ref={(scrollview) => { this.scrollview = scrollview; }}
        onScrollBeginDrag={this._onScrollBegin}
        onMomentumScrollEnd={enableMomentum ? this._onMomentumEnd : undefined}
        onScrollEndDrag={!enableMomentum || Platform.OS === 'android' ? this._onScrollEndDrag :
        undefined}
        onResponderRelease={this._onTouchRelease}
        onScroll={this._onScroll}
        onTouchStart={this._onTouchStart}
        scrollEventThrottle={16}
        bounces={false}
        {...this.props}
      >
        { this.items }
      </ScrollView>
    );
  }
}
