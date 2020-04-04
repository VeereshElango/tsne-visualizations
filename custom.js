Plotly.d3.csv('model/20_news_group_tsne_visualization.csv', function(err, rows){
		
		var perplexities = ["10","30","50","100"],
		ngrams={
			"Unigram":"1_1", "Unigram&Bigram":"1_2", "Unigram&Bigram&Trigram":"1_3",
			"Bigram":"2_2","Trigram":"3_3"
		},
		chosenPerplexity = "",
		chosenNgram="",
		allTargetNames = unpack(rows,"target_names"),
		targetNames = {},
		defaultPerplexity = perplexities[0]
		defaultNgrams = ngrams["Unigram"],
		target_color =['#2E91E5', '#E15F99', '#1CA71C', '#FB0D0D', '#DA16FF', '#222A2A', '#B68100', '#750D86', '#EB663B', '#511CFB', '#00A08B', '#FB00D1', '#FC0080', '#B2828D', '#6C7C32', '#778AAE', '#862A16', '#A777F1', '#620042', '#1616A7'],
		target_color_map = {};

		for(var i=0; i < rows.length; i++){
			var row = rows[i]
			if(row["target_names"] in targetNames){
				targetNames[row["target_names"]].push(row)
			}
			else{
				targetNames[row["target_names"]] = [row]
			}
		}

		var c_i = 0;
		for(key in targetNames){
			target_color_map[key] = target_color[c_i]
			c_i++
		}
		
		function unpack(rows, key) {
        	return rows.map(function(row) { return row[key]; });
    	}

		function assignOptions(textArray, selector) {
		  for (var i = 0; i < textArray.length;  i++) {
		      var currentOption = document.createElement('option');
		      currentOption.text = textArray[i];
		      selector.appendChild(currentOption);
		  }
		}
		
		function updatePerplexity(){
		  plotOnDemand(countrySelector.value, chosenNgram);
		}
		function updateNgramMode(){
		  plotOnDemand(chosenPerplexity, ngrams[ngramSelector.value]);
		}
    
		function plotOnDemand(perplexity, ngram_mode){
			console.log(perplexity, ngram_mode)
			chosenPerplexity = perplexity
			chosenNgram = ngram_mode
			var data = [];
			for (var key in targetNames){
				var comp1 = unpack(targetNames[key], perplexity+'_'+ngram_mode+'_comp1'),
	    		comp2 = unpack(targetNames[key],  perplexity+'_'+ngram_mode+"_comp2"),
	    		text = unpack(targetNames[key],"targetNames")

				var trace = {
			        x: comp1,
	    		    y: comp2,	    		    
	        		mode: 'markers',
	        		type: 'scatter',
	        		text:text,
	        		marker:{
	        			opacity : 0.7,
	        			size: 4,
	        			color:target_color_map[key],
	        			line: {
					      color: 'rgb(255, 255, 255)',
					      width: 0.5
					    }
	        		},
	        		name: key	        		
	      		};

			data.push(trace)
			}    

	      	var layout = {
	        	hovermode:'closest',
	        	height:550 ,
	        	legend: {
	        		"font": {
	        			"size": 10 
	        		}
	        	}
	        };
			Plotly.newPlot('plotdiv', data, layout, {showSendToCloud: true, responsive: true});

			var myPlot = document.getElementById('plotdiv'),
			hoverInfo = document.getElementById('hoverinfo');
			myPlot.on('plotly_hover', function(data){
		    	var infotext = data.points.map(function(d){
		    		targetGroup = targetNames[d.data.name]
		    		console.log(d.x, d.y, d.data.name, chosenPerplexity)
		    		data = getTextData(targetGroup, d)
		      		return (data);
		    	});
		  
		    	hoverInfo.innerHTML = infotext.join('<br/>');
			})
		 	.on('plotly_unhover', function(data){
		    	hoverInfo.innerHTML = '';
			});
		}

  		plotOnDemand(defaultPerplexity, defaultNgrams)
  		var ngramSelector = document.querySelector('.ngrams')
  		assignOptions(Object.keys(ngrams), ngramSelector)
  		ngramSelector.addEventListener('change', updateNgramMode, false);

  		var innerContainer = document.querySelector('[data-num="0"'),
		countrySelector = innerContainer.querySelector('.countrydata');
		assignOptions(perplexities, countrySelector);
		countrySelector.addEventListener('change', updatePerplexity, false);
		
		function getTextData(targetGroup, d){
			for(var i=0; i< targetGroup.length;i++){
	    			row = targetGroup[i]
	    			if((row[chosenPerplexity+"_"+chosenNgram+"_comp1"] === d.x.toString() && row[chosenPerplexity+"_"+chosenNgram+"_comp2"] === d.y.toString()) ){
	    				return "<kbd>"+d.data.name+"</kbd><br>"+row["data"]
	    				.replace("From","<br><mark>From</mark>")
	    				.replace("Subject","<br><mark>Subject</mark>")
	    				.replace("Lines","<br><mark>Lines</mark>")
	    				.replace("Organization","<br><mark>Organization</mark>");
	    			}
	    		}
	    	return "no data"
		}
		
	})