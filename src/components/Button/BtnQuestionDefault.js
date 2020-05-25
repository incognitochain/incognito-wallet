import React from 'react';
import { TouchableOpacity } from 'react-native';
import srcQuestionIcon from '@src/assets/images/icons/question_black.png';
import { QuestionIcon } from '@src/components/Icons';

const BtnQuestionDefault = props => {
  return (
    <TouchableOpacity {...props}>
      <QuestionIcon icon={srcQuestionIcon} />
    </TouchableOpacity>
  );
};

BtnQuestionDefault.propTypes = {};

export default BtnQuestionDefault;
