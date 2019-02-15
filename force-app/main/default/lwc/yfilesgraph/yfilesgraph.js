/* global yfiles */
import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import YFILES from '@salesforce/resourceUrl/yfiles';
import DATA from './data';



const modules = [
    "core-lib.js",
    "graph-core.js",
    "graph-binding.js",
    "graph-styles-core.js",
    "graph-styles-default.js",
    "graph-styles-other.js",
    "graph-input.js",

    "algorithms.js",
    "layout-core.js",
    "layout-hierarchic.js",

    "graph-layout-bridge.js",
    ]


export default class Yfilesgraph extends LightningElement {
    graphHeight = 600;

    graphInitialized = false;

    async renderedCallback() {
        if (this.graphInitialized) {
            return;
        }
        this.graphInitialized = true;

        try {
            await Promise.all([
                loadScript(this, YFILES + '/lang.js'),
                loadStyle(this, YFILES + '/yfiles.css')
            ])

            yfiles.license = {
                "date": "02/15/2019",
                "distribution": false,
                "expires": "04/17/2019",
                "fileSystemAllowed": true,
                "licensefileversion": "1.1",
                "localhost": true,
                "oobAllowed": false,
                "package": "complete",
                "product": "yFiles for HTML",
                "type": "eval",
                "version": "2.1",
                "watermark": "yFiles HTML Evaluation License (expires in ${license-days-remaining} days)",
                "key": "replace-all-of-this-with-your-own-license"
            }

            for (let i = 0; i < modules.length; i++){
                await loadScript(this, `${YFILES}/${modules[i]}`)
            }
            this.initializeGraph();
        } catch (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading yFiles for HTML',
                    message: error.message,
                    variant: 'error'
                })
            );
        }
    }

    initializeGraph() {

        const div = this.template.querySelector('div.graphcomponent');
        const graphComponent = new yfiles.view.GraphComponent({div, inputMode:new yfiles.input.GraphEditorInputMode()})

        const builder = new yfiles.binding.GraphBuilder(graphComponent.graph)
        builder.nodesSource = DATA.nodes
        builder.edgesSource = DATA.links
        builder.nodeIdBinding = n => n.id
        builder.sourceNodeBinding = l => l.source
        builder.targetNodeBinding = l => l.target

        builder.graph.nodeDefaults.style = new yfiles.styles.WebGLShapeNodeStyle({color:"blue"})
        builder.graph.edgeDefaults.style = new yfiles.styles.WebGLPolylineEdgeStyle()
        

        builder.buildGraph()

        graphComponent.morphLayout(new yfiles.hierarchic.HierarchicLayout())
    }
}
