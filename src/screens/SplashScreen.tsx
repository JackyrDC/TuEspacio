import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
} from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Colors, Sizes, Fonts } from '../constants/Colors';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

// Mantener la splash screen visible hasta que estemos listos
SplashScreen.preventAutoHideAsync();

export default function CustomSplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const fadeOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const startAnimation = async () => {
      // Ocultar la splash screen nativa
      await SplashScreen.hideAsync();
      
      // Secuencia de animaciones
      Animated.sequence([
        // 1. Aparecer logo con escala
        Animated.parallel([
          Animated.timing(logoOpacity, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.spring(logoScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }),
        ]),
        
        // 2. Aparecer título
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        
        // 3. Aparecer subtítulo
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        
        // 4. Esperar un momento
        Animated.delay(1000),
        
        // 5. Fade out todo
        Animated.timing(fadeOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onFinish();
      });
    };

    startAnimation();
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: fadeOpacity }]}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      
      <View style={styles.blueBackground}>
        <View style={styles.content}>
          {/* Logo */}
          <Animated.View 
            style={[
              styles.logoContainer,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }]
              }
            ]}
          >
            <Image
              source={require('../../assets/icons/TuEspacio.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </Animated.View>

          {/* Título */}
          <Animated.Text 
            style={[
              styles.title,
              { opacity: titleOpacity }
            ]}
          >
            TuEspacio
          </Animated.Text>

          {/* Subtítulo */}
          <Animated.Text 
            style={[
              styles.subtitle,
              { opacity: subtitleOpacity }
            ]}
          >
            Encuentra alojamiento seguro en Comayagua
          </Animated.Text>

          {/* Indicador de carga */}
          <Animated.View 
            style={[
              styles.loadingContainer,
              { opacity: subtitleOpacity }
            ]}
          >
            <View style={styles.loadingDot} />
            <View style={[styles.loadingDot, { backgroundColor: Colors.accent }]} />
            <View style={styles.loadingDot} />
          </Animated.View>
            </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  blueBackground: {
    flex: 1,
    backgroundColor: Colors.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Sizes.xl,
  },
  logoContainer: {
    marginBottom: Sizes.xl,
    borderRadius: 80,
    backgroundColor: Colors.white,
    padding: Sizes.lg,
    shadowColor: Colors.shadowColor,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
    // Añadir un borde sutil para destacar más en el gradiente
    borderWidth: 2,
    borderColor: Colors.white + '80',
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: Sizes.fontXXL + 8,
    fontWeight: 'bold',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Sizes.md,
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: Sizes.fontLG,
    color: Colors.white,
    textAlign: 'center',
    opacity: 0.9,
    fontFamily: Fonts.regular,
    lineHeight: 24,
    marginBottom: Sizes.xxl,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Sizes.xl,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.white,
    marginHorizontal: 4,
    opacity: 0.7,
  },
});