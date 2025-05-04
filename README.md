# Codeforces Problem Recommender

<a href = "https://codeforces.com/">Codeforces</a> is a very popular web platform that hosts competitive programming contests. It also has a multitude of problems of varying difficulty levels for all types of programmers, be it a newbie or an expert. 

Often, users find it difficult to choose unsolved problems to solve for practice. We have built a website that **recommends 3 categories of problems** (**Easy**, **Medium** and **Hard**) to the user, **based on there codeforces rating**. The problems are randomly chosen, and are only those which are not solved by the user yet.

This repository includes all the codes which the website uses. The website can be accessed at https://codeforces-problem-recommender.vercel.app/

## Logic for Problem Recommendation
After some mathematical analysis and curve fitting, the authors derived the following equations to determine the acceptable range of ratings for the problems recommended in each category.
<div align = "center">
  <img src = "https://user-images.githubusercontent.com/39689610/117701922-71372a80-b1e5-11eb-873c-08aaee9b3c02.png" width = "600" height = "173">
 </div>
 <br>

The problems that are unsolved by the user, and also satisfy the above constraints, are pooled together. Problems from these pools are then chosen randomly to be displayed to the user.


## Demonstration
1. Open the <a href = "https://codeforces-problem-recommender.vercel.app/">website</a>, and enter your codeforces user handle.
<div align = "center">
  <kbd>
    <img src = "https://github.com/user-attachments/assets/44ae5de0-5dcc-4c0a-b579-a3903d135b2d">
  </kbd>
 </div>
 <br>

 
 2. Click the **Go** button, or press _Enter_. You will see the **user statistics**, **recommended problems** in all 3 categories, and a list of **recent contests** that the user has participated in on Codeforces.
<div align = "center">
  <kbd>
    <img src = "https://github.com/user-attachments/assets/a9732758-a92f-43c7-abbb-59e2a9998e4d">
  </kbd>
 </div>
 <br>
 <div align = "center">
  <kbd>
    <img src = "https://github.com/user-attachments/assets/3f4aaa54-b7a4-4eb0-952d-b9f98a3a4027">
  </kbd>
 </div>

  
# Credits
All the credit goes to [Vaibhav Kesarwani](https://vaibhavkesarwani.vercel.app/).
