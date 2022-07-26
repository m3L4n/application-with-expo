import { Text, View , StyleSheet} from 'react-native';

export default function ShowMessage (props){
  console.log("props", props)
    return (
      <View>
        <Text style={styles.color}> Welcome on the {props.msg} </Text>
      </View>
    );
  }

  const styles = StyleSheet.create({
    color: {
      color: 'pink',
      fontSize: 30,
    },
  });