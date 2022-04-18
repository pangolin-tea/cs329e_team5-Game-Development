// things we dont wanna completely get rid of yet, but are taking up space in other files




// var Message = new Phaser.Class({

//     Extends: Phaser.GameObjects.Container,

//     initialize:
//     function Message(scene, events) {
//         Phaser.GameObjects.Container.call(this, scene);
//         var graphics = this.scene.add.graphics();
//         this.add(graphics);
//         graphics.lineStyle(1, 0xffffff, 0.8);
//         graphics.fillStyle(0x031f4c, 0.3);        
//         graphics.strokeRect(-90, -15, 180, 30);
//         graphics.fillRect(-90, -15, 180, 30);
//         this.text = new Phaser.GameObjects.Text(scene, 0, 0, "", { color: "#ffffff", align: "center", fontSize: 15, wordWrap: { width: 180, useAdvancedWrap: true }});
//         this.add(this.text);
//         this.text.setOrigin(0.5);        
//         events.on("Message", this.showMessage, this);
//         this.visible = false;
//     },
//     showMessage: function(text) {
//         this.text.setText(text);
//         this.visible = true;
//         if(this.hideEvent)
//             this.hideEvent.remove(false);
//         this.hideEvent = this.scene.time.addEvent({ delay: 2000, callback: this.hideMessage, callbackScope: this });
//     },
//     hideMessage: function() {
//         this.hideEvent = null;
//         this.visible = false;
//     }
// });

// this.message = new Message(this, this.events);
// this.add.existing(this.message); 



// camera.setBounds(0, 0, map.widthInPixels, map.heightInPixels);



