import { Text, TouchableOpacity, View } from '@src/components/core';
import PropTypes from 'prop-types';
import React from 'react';
import { sectionStyle } from './Section.styled';

export const SectionItem = (
  { data: { title, desc, handlePress, subDesc, styleItem = null } },
  lastItem,
) => (
  <TouchableOpacity
    style={[sectionStyle.item, lastItem && sectionStyle.lastItem, styleItem]}
    onPress={handlePress}
  >
    <View style={sectionStyle.infoContainer}>
      {title && <Text style={sectionStyle.label}>{title}</Text>}
      {desc && <Text style={sectionStyle.desc}>{desc}</Text>}
      {subDesc && (
        <Text style={[sectionStyle.desc, sectionStyle.subDesc]}>{subDesc}</Text>
      )}
    </View>
  </TouchableOpacity>
);

const Section = ({ label, items, customItems, headerRight, labelStyle }) => {
  return (
    <View style={sectionStyle.container}>
      <View style={sectionStyle.header}>
        <Text style={[sectionStyle.label, labelStyle]}>{label}</Text>
        {headerRight}
      </View>
      {customItems ? (
        customItems
      ) : (
        <View style={sectionStyle.items}>
          {items &&
            items.map((item, index) => (
              <SectionItem
                key={index}
                data={item}
                lastItem={index === items.length - 1}
              />
            ))}
        </View>
      )}
    </View>
  );
};

const itemShape = PropTypes.shape({
  icon: PropTypes.node,
  title: PropTypes.string,
  desc: PropTypes.string,
  handlePress: PropTypes.func,
});

Section.defaultProps = {
  label: '',
  items: undefined,
  customItems: undefined,
};
Section.propTypes = {
  label: PropTypes.string,
  items: PropTypes.arrayOf(itemShape),
  customItems: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.element),
    PropTypes.element,
  ]),
};

SectionItem.defaultProps = {
  data: undefined,
};
SectionItem.propTypes = {
  data: itemShape,
};

export default Section;
