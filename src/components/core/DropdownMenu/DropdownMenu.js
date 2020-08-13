import React from 'react';
import { View, StyleSheet, Text, SectionList } from 'react-native';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/Entypo';
import { COLORS, FONT } from '@src/styles';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';

const styled = StyleSheet.create({
  container: {
    flex: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontFamily: FONT.NAME.bold,
    fontSize: FONT.SIZE.superMedium,
    lineHeight: FONT.SIZE.superMedium + 4,
    color: COLORS.BLACK,
  },
});

const DropdownMenu = (props) => {
  const { defaultToggle, sections, ...rest } = props;
  const [toggle, setToggle] = React.useState(defaultToggle);
  const sectionsData = sections.map((section) => ({
    ...section,
    data: toggle ? section?.data : [],
  }));
  return (
    <SectionList
      style={styled.container}
      sections={sectionsData}
      keyExtractor={(item, index) => item + index}
      renderSectionHeader={({ section: { label } }) => (
        <TouchableWithoutFeedback
          onPress={() => {
            setToggle(!toggle);
          }}
        >
          <View style={styled.labelContainer}>
            <Text style={styled.label}>{label}</Text>
            <Icon
              name={`chevron-thin-${toggle ? 'up' : 'down'}`}
              size={20}
              color={COLORS.colorGreyBold}
            />
          </View>
        </TouchableWithoutFeedback>
      )}
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      {...rest}
    />
  );
};

DropdownMenu.defaultProps = {
  defaultToggle: false,
};

DropdownMenu.propTypes = {
  defaultToggle: PropTypes.bool,
  sections: PropTypes.array.isRequired,
};

export default DropdownMenu;
