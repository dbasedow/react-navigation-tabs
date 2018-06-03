/* @flow */

import * as React from 'react';
import {
  TabRouter,
  StackActions,
  SceneView,
  createNavigator,
  createNavigationContainer,
  NavigationActions,
} from 'react-navigation';

export type InjectedProps = {
  getLabelText: (props: { route: any }) => any,
  getAccessibilityLabelText: (route: any) => string,
  getTestID: (route: any) => string,
  renderIcon: (props: {
    route: any,
    focused: boolean,
    tintColor: string,
  }) => React.Node,
  renderScene: (props: { route: any }) => ?React.Node,
  onIndexChange: (index: number) => any,
  onTabPress: (props: { route: any }) => mixed,
  navigation: any,
  descriptors: any,
  screenProps?: any,
};

export default function createTabNavigator(TabView: React.ComponentType<*>) {
  class NavigationView extends React.Component<*> {
    _renderScene = ({ route }) => {
      const { screenProps, descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const TabComponent = descriptor.getComponent();
      return (
        <SceneView
          screenProps={screenProps}
          navigation={descriptor.navigation}
          component={TabComponent}
        />
      );
    };

    _renderIcon = ({ route, focused = true, tintColor }) => {
      const { descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const options = descriptor.options;

      if (options.tabBarIcon) {
        return typeof options.tabBarIcon === 'function'
          ? options.tabBarIcon({ focused, tintColor })
          : options.tabBarIcon;
      }

      return null;
    };

    _getLabelText = ({ route }) => {
      const { descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const options = descriptor.options;

      if (options.tabBarLabel) {
        return options.tabBarLabel;
      }

      if (typeof options.title === 'string') {
        return options.title;
      }

      return route.routeName;
    };

    _getAccessibilityLabelText = route => {
      const { descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const options = descriptor.options;

      if (options.tabBarAccessibilityLabel) {
        return options.tabBarAccessibilityLabel;
      }

      return this._getLabelText({ route });
    };

    _getTestID = route => {
      const { descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const options = descriptor.options;

      if (options.tabBarTestID) {
        return options.tabBarTestID;
      }

      return route.routeName;
    };

    _handleTabPress = ({ route }) => {
      this._isTabPress = true;

      const { descriptors } = this.props;
      const descriptor = descriptors[route.key];
      const { navigation, options } = descriptor;

      const defaultHandler = () => {
        if (navigation.isFocused()) {
          if (route.hasOwnProperty('index') && route.index > 0) {
            // If current tab has a nested navigator, pop to top
            navigation.dispatch(StackActions.popToTop({ key: route.key }));
          } else {
            // TODO: do something to scroll to top
          }
        } else {
          this._jumpTo(route.routeName);
        }
      };

      if (options.tabBarOnPress) {
        options.tabBarOnPress({ navigation, defaultHandler });
      } else {
        defaultHandler();
      }
    };

    _handleIndexChange = index => {
      if (this._isTabPress) {
        this._isTabPress = false;
        return;
      }

      this._jumpTo(this.props.navigation.state.routes[index].routeName);
    };

    _jumpTo = routeName =>
      this.props.navigation.dispatch(NavigationActions.navigate({ routeName }));

    _isTabPress: boolean = false;

    render() {
      const { descriptors, navigation, screenProps } = this.props;
      const { state } = navigation;
      const route = state.routes[state.index];
      const descriptor = descriptors[route.key];
      const options = {
        ...this.props.navigationConfig,
        ...descriptor.options,
      };

      return (
        <TabView
          {...options}
          getLabelText={this._getLabelText}
          getAccessibilityLabelText={this._getAccessibilityLabelText}
          getTestID={this._getTestID}
          renderIcon={this._renderIcon}
          renderScene={this._renderScene}
          onIndexChange={this._handleIndexChange}
          onTabPress={this._handleTabPress}
          navigation={navigation}
          descriptors={descriptors}
          screenProps={screenProps}
        />
      );
    }
  }

  return (routes: *, config: * = {}) => {
    const router = TabRouter(routes, config);
    const navigator = createNavigator(NavigationView, router, config);

    return createNavigationContainer(navigator);
  };
}
