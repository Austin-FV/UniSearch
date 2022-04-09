import React, { Component } from "react";
import Graph from "react-graph-vis";
import { v4 as uuidv4 } from 'uuid';
import "./styles/GraphFlow.css";


class GraphFlow extends Component{
   constructor(props){
      super(props);

      this.newGraph = {
         nodes:[],
         edges:[]
      };

      this.colour_list = ["#c0c0c0","#ffd875","#ffabab","#a8d4ff","#d8ff96","#ff82c6","#ffad73","#df9eff","#b5ffff","#ffdbad"];

      this.options = {
         layout: {
            hierarchical: {
                  direction: 'UD',
                  sortMethod: 'directed',
                  treeSpacing: 100,
            }
         },  
         edges: {
            color: "#000000"
         },
         height: "700px"
      };
   }
 
   updateGraph(newDataStruct){
      // Clearing last graph
      this.newGraph = {
         nodes:[],
         edges:[]
      };
      for (const [key, value] of Object.entries(newDataStruct)) {
         for (const [newKey, newValue] of Object.entries(value)) {
            let newNode = {};
            newNode["id"] = newValue["code"];
            newNode["label"] = newValue["code"];
            newNode["title"] = newValue["desc"];
            let splitCode = newValue["code"].split("*");
            let codeNumber = splitCode[splitCode.length - 1];
            codeNumber = parseInt(codeNumber[0]);
            newNode["color"] = this.colour_list[codeNumber];
   
            if (newValue["prereq_simple"].length!=0){
               for (let j = 0; j < newValue["prereq_simple"].length; j++){
                  let newEdge = {};
                  newEdge["to"] = newValue["code"];
                  newEdge["from"] = newValue["prereq_simple"][j];
                  this.newGraph["edges"].push(newEdge);
               }
            }
            this.newGraph["nodes"].push(newNode);
         }
     }
     this.forceUpdate();
   }


   // Call this to drop/re-register a course and its children, then update
   dropHandler(node){
      // get original colour
      let nodes = this.newGraph['nodes'];
      // Find node in data struct
      for(let i = 0; i < nodes.length;i++){
         if(nodes[i]['id'] == node[0]){
            //register/drop courses
            if(nodes[i]['color'] == this.colour_list[0]){
               this.undropNode(node[0])
            }else{
               this.dropNode(node[0])
            }
            break;
         }
      }

      // show the new updates
      this.forceUpdate();
   }

   dropNode(node) {
      let nodes = this.newGraph['nodes'];
      let edges = this.newGraph['edges'];
      for(let i = 0; i < nodes.length;i++){
         // Find the node in the data struct
         if(nodes[i]['id'] == node){
            // Update colour
            this.newGraph['nodes'][i]['color'] = this.colour_list[0];
            for(let j = 0; j < edges.length;j++){
               if(edges[j]['from'] == node){
                  // changing children
                  this.dropNode(edges[j]['to']);
               }
            }
            break;
         }
      }
   }

   undropNode(node) {
      let nodes = this.newGraph['nodes'];
      let edges = this.newGraph['edges'];
      for(let i = 0; i < nodes.length;i++){
         // Find the node in the data struct
         if(nodes[i]['id'] == node){
            // Update colour
            let colour_index = node.split('*')[1][0]
            this.newGraph['nodes'][i]['color'] = this.colour_list[colour_index];
            for(let j = 0; j < edges.length;j++){
               if(edges[j]['from'] == node){
                  // changing children
                  this.undropNode(edges[j]['to']);
               }
            }
            break;
         }
      }
   }

   render(){
      return (
         <Graph
            graph={this.newGraph}
            options={this.options}
            events={{
               selectNode: (event) => {
               var { nodes, edges } = event;
               this.dropHandler(nodes, edges);
               }
            }}
            key={uuidv4()} 
            // getNetwork={network => {
            //    //  if you want access to vis.js network api you can set the state in a parent component using this property
            // }}
         />
      );
   }
}

export default GraphFlow;