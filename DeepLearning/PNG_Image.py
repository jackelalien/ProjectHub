# -*- coding: utf-8 -*-
"""
Created on Wed Dec  5 23:12:05 2018

@author: VRDesktrop
"""
import tensorflow as tf
import csv
from PIL import Image

class PNG_Image:
    def __init__(self):
        self.image = tf.Variable([], dtype = tf.string, trainable=False)
        self.height = tf.Variable([], dtype = tf.int64, trainable=False)
        self.width = tf.Variable([], dtype = tf.int64, trainable=False)
        self.image_raw = tf.Variable([], dtype = tf.string, trainable=False)
        self.label = tf.Variable([], dtype = tf.int32, trainable=False)
        
        
