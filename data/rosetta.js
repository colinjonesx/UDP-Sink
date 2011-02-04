/**
 * rosetta a file for defining allowed inbound messages and how to handle them
 */
Rosetta = {
  _desc:'object containing bindings for translation of messages',
  TESTAPP:{
    filenameSuffix:'test',
    prepared:false,
    processData:function(data, j){}
    
  }
};
exports.Rosetta = Rosetta;