import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../../core/theme/app_colors.dart';

class AnimatedSegmentedControl extends StatelessWidget {
  final List<String> segments;
  final int selectedIndex;
  final ValueChanged<int> onValueChanged;

  const AnimatedSegmentedControl({
    super.key,
    required this.segments,
    required this.selectedIndex,
    required this.onValueChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: AppColors.surfaceVariant.withValues(alpha: 0.5),
        borderRadius: BorderRadius.circular(100),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth / segments.length;
          return Stack(
            children: [
              // Sliding background pill
              AnimatedPositioned(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeOutCubic,
                left: selectedIndex * width,
                top: 0,
                bottom: 0,
                child: Container(
                  width: width,
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(100),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.06),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                ),
              ),
              Row(
                children: List.generate(
                  segments.length,
                  (index) => Expanded(
                    child: GestureDetector(
                      onTap: () {
                        HapticFeedback.selectionClick();
                        onValueChanged(index);
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        color: Colors.transparent,
                        child: Center(
                          child: Text(
                            segments[index],
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: selectedIndex == index
                                  ? FontWeight.w800
                                  : FontWeight.w600,
                              color: selectedIndex == index
                                  ? AppColors.primary
                                  : AppColors.textSecondary,
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
